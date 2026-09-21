import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { calculateLevel } from "@/lib/level";
import { localDateKey } from "@/lib/streak";
import { AppNav } from "@/components/AppNav";
import { Card, Button, XPBar, Badge } from "@/components/ui";
import { ActivityButton } from "./ActivityButton";
import Link from "next/link";

export const metadata = {
  title: "Dashboard — Nihon Quest",
};

export default async function AppHome() {
  const session = await getServerSession(authOptions);
  const uid = (session?.user as { id?: string } | undefined)?.id;
  if (!uid) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: uid } });
  if (!user) redirect("/login");
  if (!user.onboardingCompleted) redirect("/onboarding");

  const level = calculateLevel(user.totalXP);
  const dueReviews = await prisma.reviewItem.count({
    where: { userId: uid, dueAt: { lte: new Date() } },
  });

  const totalReviewsInSRS = await prisma.reviewItem.count({
    where: { userId: uid },
  });

  const userLevel = user.learningLevel ?? "N5";

  const allLessons = await prisma.lesson.findMany({
    where: { isPublished: true, level: userLevel },
    orderBy: { order: "asc" },
    include: { progress: { where: { userId: uid } } },
  });

  const completedLessonsCount = allLessons.filter((l) => l.progress[0]?.status === "COMPLETED").length;
  const currentLesson = allLessons.find((l) => l.progress[0]?.status !== "COMPLETED") || allLessons[0];
  const lessonProgressPercent = Math.round((completedLessonsCount / Math.max(1, allLessons.length)) * 100);

  const journeyLocations = await prisma.journeyLocation.findMany({
    orderBy: { order: "asc" },
    include: { userProgress: { where: { userId: uid } } },
    take: 5,
  });
  const completedJourneyCount = await prisma.userJourneyProgress.count({
    where: { userId: uid, status: "COMPLETED" },
  });
  const totalJourneyLocations = await prisma.journeyLocation.count();

  const today = localDateKey(new Date(), user.timezone || "UTC");
  let missions = await prisma.userDailyMission.findMany({
    where: { userId: uid, date: today },
    include: { mission: true },
  });

  if (!missions.length) {
    const templates = await prisma.dailyMission.findMany();
    for (const t of templates) {
      await prisma.userDailyMission.upsert({
        where: { userId_missionId_date: { userId: uid, missionId: t.id, date: today } },
        update: {},
        create: { userId: uid, missionId: t.id, date: today, targetCount: t.targetCount },
      });
    }
    missions = await prisma.userDailyMission.findMany({
      where: { userId: uid, date: today },
      include: { mission: true },
    });
  }

  // Personalization based on user's goal & level
  const isBeginner = userLevel === "N5" && completedLessonsCount < 2;
  const isTravelGoal = user.learningGoal === "TRAVEL";
  const isConversationGoal = user.learningGoal === "CONVERSATION";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AppNav />

      {/* Top Header Bar: Clean & Ergonomic */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="sakura">
              LỘ TRÌNH JLPT {userLevel} · {user.dailyGoalMinutes} PHÚT/NGÀY
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            こんにちは, {user.name || user.email.split("@")[0]}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {isBeginner
              ? "Hãy bắt đầu với bảng chữ cái và các câu chào hỏi căn bản nhất."
              : isTravelGoal
              ? "Tích lũy từ vựng du lịch và mở khóa các chặng tàu Shinkansen."
              : isConversationGoal
              ? "Củng cố phản xạ đối đáp và nâng cao khả năng giao tiếp thực tế."
              : "Hôm nay là một ngày tuyệt vời để củng cố tiếng Nhật vào trí nhớ dài hạn."}
          </p>
        </div>

        {/* Quick Streak & Daily Attendance Widget */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900 shadow-sm">
            <span className="text-xl">🔥</span>
            <div>
              <p className="text-xs font-black text-orange-600 dark:text-orange-400 leading-tight">
                {user.currentStreak} ngày liên tiếp
              </p>
              <p className="text-[10px] text-slate-400">Kỷ lục: {user.longestStreak} ngày</p>
            </div>
          </div>
          <ActivityButton />
        </div>
      </div>

      {/* Main 2-Column Bento Workspace Grid for Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =========================================================
            LEFT COLUMN (8 cols): Primary Action & Quick Learning Hub
            ========================================================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* Primary Action Card: Next Lesson Focus */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sumi-900 via-[#1a1d36] to-slate-950 p-6 sm:p-7 text-white border border-slate-800 shadow-xl">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-sakura-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sakura-500/20 text-sakura-300 border border-sakura-500/30">
                    🎯 TODAY&apos;S FOCUS
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Bài #{currentLesson ? currentLesson.order + 1 : 1} / {allLessons.length}
                  </span>
                </div>
                <span className="text-xs font-bold text-sakura-400">{lessonProgressPercent}% hoàn thành</span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {currentLesson ? currentLesson.title : "Hoàn Thành Toàn Bộ Khóa Học"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                  {currentLesson
                    ? currentLesson.description
                    : `Chúc mừng bạn đã hoàn tất toàn bộ bài học ${userLevel}! Hãy tiếp tục ôn tập thẻ SRS và du ngoạn Nhật Bản.`}
                </p>
              </div>

              {/* Progress bar */}
              <div className="space-y-1 pt-0.5">
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sakura-500 to-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${lessonProgressPercent}%` }}
                  />
                </div>
              </div>

              {/* Primary Action Button */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {currentLesson ? (
                  <Link href={`/app/practice/${currentLesson.slug}`}>
                    <Button variant="sakura" size="md" className="font-black px-6 shadow-md shadow-sakura-500/25">
                      Tiếp tục bài học →
                    </Button>
                  </Link>
                ) : (
                  <Link href="/app/practice">
                    <Button variant="sakura" size="md" className="font-black">
                      Xem danh sách bài học 📖
                    </Button>
                  </Link>
                )}

                <Link href="/app/practice">
                  <Button variant="outline" size="md" className="font-bold border-slate-700 text-slate-200 hover:bg-slate-800">
                    Xem tất cả bài học
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Learning & Practice Hub (4 Ergonomic Grid Tiles) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                TRUNG TÂM LUYỆN TẬP NHANH
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tile 1: SRS Spaced Repetition */}
              <Link href="/app/review" className="block group">
                <Card
                  hover
                  className="p-5 h-full flex flex-col justify-between border-2 border-indigo-100 hover:border-indigo-300 dark:border-slate-800 dark:hover:border-indigo-800 bg-gradient-to-br from-white via-indigo-50/15 to-white dark:from-sumi-900 dark:via-sumi-950 dark:to-sumi-900"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-xl">
                        🎴
                      </div>
                      <Badge variant={dueReviews > 0 ? "sakura" : "matcha"}>
                        {dueReviews > 0 ? `${dueReviews} thẻ đến hạn` : "Đã xong"}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-sakura-600 dark:group-hover:text-sakura-400 transition">
                        Hàng Đợi Ôn Tập (SRS)
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        Chống quên lãng với thuật toán SM-2. ({totalReviewsInSRS} thẻ trong bộ nhớ)
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 flex items-center text-xs font-bold text-sakura-600 dark:text-sakura-400">
                    <span>{dueReviews > 0 ? "Ôn tập ngay" : "Xem thẻ ôn tập"}</span>
                    <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Card>
              </Link>

              {/* Tile 2: Kana Lab */}
              <Link href="/app/learn" className="block group">
                <Card
                  hover
                  className="p-5 h-full flex flex-col justify-between border-2 border-rose-100 hover:border-rose-300 dark:border-slate-800 dark:hover:border-rose-900 bg-gradient-to-br from-white via-rose-50/15 to-white dark:from-sumi-900 dark:via-sumi-950 dark:to-sumi-900"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-xl font-bold font-jp text-sakura-600">
                        あ
                      </div>
                      <Badge variant="sakura">46 Ký Tự</Badge>
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-sakura-600 dark:group-hover:text-sakura-400 transition">
                        Kana Lab — Bảng Chữ Cái
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        Luyện viết nét Hiragana & Katakana kèm âm thanh chuẩn bản xứ.
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 flex items-center text-xs font-bold text-sakura-600 dark:text-sakura-400">
                    <span>Luyện bảng chữ cái</span>
                    <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Card>
              </Link>

              {/* Tile 3: Vocab & Kanji Lab */}
              <Link href="/app/vocabulary" className="block group">
                <Card
                  hover
                  className="p-5 h-full flex flex-col justify-between border-2 border-slate-200/80 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-white dark:bg-sumi-900"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-xl font-bold font-jp text-amber-700">
                        漢
                      </div>
                      <Badge variant="amber">JLPT {userLevel}</Badge>
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-sakura-600 dark:group-hover:text-sakura-400 transition">
                        Kho Từ Vựng & Hán Tự
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        Tra cứu nghĩa, phát âm và ví dụ thực tế kèm tính năng lưu SRS 1 chạm.
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 flex items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Tra cứu từ vựng</span>
                    <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Card>
              </Link>

              {/* Tile 4: Survival Mode */}
              <Link href="/app/survival" className="block group">
                <Card
                  hover
                  className="p-5 h-full flex flex-col justify-between border-2 border-slate-200/80 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-white dark:bg-sumi-900"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-xl">
                        🍜
                      </div>
                      <Badge variant="matcha">Thực Chiến</Badge>
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-sakura-600 dark:group-hover:text-sakura-400 transition">
                        Survival Mode — Sinh Tồn
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        Thử thách phản xạ từ vựng & xử lý tình huống giao tiếp theo thời gian thực.
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 flex items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Bắt đầu thử thách</span>
                    <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Card>
              </Link>
            </div>
          </div>
        </div>

        {/* =========================================================
            RIGHT COLUMN (4 cols): User Stats, Missions & Shinkansen
            ========================================================= */}
        <div className="lg:col-span-4 space-y-5">
          {/* Experience & Level Card */}
          <Card className="p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-sumi-900">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
              <span className="uppercase tracking-wider">CẤP ĐỘ HỌC VIÊN</span>
              <span>✨</span>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl sm:text-3xl font-black text-amber-500">
                Level {level.level}
              </p>
              <span className="text-xs font-bold text-slate-500">{user.totalXP.toLocaleString()} XP</span>
            </div>

            <XPBar
              currentXP={user.totalXP}
              nextLevelXP={level.nextLevelXP}
              level={level.level}
              className="mt-3"
            />
          </Card>

          {/* Daily Missions Card */}
          <Card className="p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-sumi-900">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎯</span>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Nhiệm Vụ Hôm Nay
                </h3>
              </div>
              <Badge variant="amber">Reset 00:00</Badge>
            </div>

            <div className="space-y-2.5">
              {missions.slice(0, 2).map((m) => {
                const isDone = m.status === "COMPLETED";
                const percent = Math.min(100, Math.round((m.progress / Math.max(1, m.targetCount)) * 100));

                return (
                  <div
                    key={m.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      isDone
                        ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20"
                        : "border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-sumi-800/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {m.mission.title}
                      </span>
                      <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 shrink-0">
                        +{m.mission.xpReward} XP
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold mt-1.5 mb-1">
                      <span>{m.progress} / {m.targetCount}</span>
                      <span>{percent}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-sumi-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${isDone ? "bg-emerald-500" : "bg-sakura-500"}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Shinkansen Travel Mini Card */}
          <Card className="p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-sumi-900">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🗾</span>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Hành Trình Shinkansen
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {completedJourneyCount} / {totalJourneyLocations} địa danh
                  </p>
                </div>
              </div>
              <Link href="/app/journey">
                <span className="text-xs font-bold text-sakura-600 dark:text-sakura-400 hover:underline">
                  Bản đồ →
                </span>
              </Link>
            </div>

            {/* Visual Station Spine */}
            <div className="grid grid-cols-5 gap-1.5 my-2">
              {journeyLocations.map((loc, idx) => {
                const isDone = loc.userProgress[0]?.status === "COMPLETED";
                const isStamped = loc.userProgress[0]?.isStamped;

                return (
                  <div key={loc.id} className="text-center space-y-1">
                    <div
                      className={`w-8 h-8 mx-auto rounded-xl flex items-center justify-center text-xs font-black border transition-all ${
                        isDone
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                          : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-sumi-800 text-slate-400"
                      }`}
                      title={loc.name}
                    >
                      {isStamped ? "💮" : isDone ? "✓" : idx + 1}
                    </div>
                    <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 truncate">
                      {loc.name}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Link href="/app/journey" className="text-[11px] text-sakura-600 dark:text-sakura-400 font-bold hover:underline">
                Khám phá Không Gian Văn Hóa 🏯
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
