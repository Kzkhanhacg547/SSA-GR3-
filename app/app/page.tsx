import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { calculateLevel } from "@/lib/level";
import { localDateKey } from "@/lib/streak";
import { AppNav } from "@/components/AppNav";
import { Card, Button, XPBar, Badge } from "@/components/ui";
import { ActivityButton } from "./ActivityButton";
import { buildEnrichedLeaderboard } from "@/lib/rivalBots";
import Link from "next/link";

export const metadata = {
  title: "Dashboard — Nihon Quest",
};

// Curated daily Japanese inspiring quotes / proverbs
const DAILY_INSPIRATIONS = [
  {
    kanji: "七転び八起き",
    furigana: "ななころびやおき",
    romaji: "Nana korobi ya oki",
    meaning: "Ngã bảy lần, đứng dậy tám lần. Kiên trì là chìa khóa làm chủ Nhật ngữ.",
    tag: "Động lực mỗi ngày",
  },
  {
    kanji: "継続は力なり",
    furigana: "けいぞくはちからなり",
    romaji: "Keizoku wa chikara nari",
    meaning: "Kiên trì tạo nên sức mạnh. Mỗi ngày 10 phút tích lũy thành thành công lớn.",
    tag: "Châm ngôn học tập",
  },
  {
    kanji: "一期一会",
    furigana: "いちごいちえ",
    romaji: "Ichigo ichie",
    meaning: "Nhất kỳ nhất hội. Trân trọng từng khoảnh khắc và cơ hội học hỏi hôm nay.",
    tag: "Triết lý sống",
  },
  {
    kanji: "千里の道も一歩から",
    furigana: "せんりのみちもいっぽから",
    romaji: "Senri no michi mo ippo kara",
    meaning: "Hành trình vạn dặm bắt đầu từ một bước chân. Hãy hoàn thành bài học hôm nay!",
    tag: "Khởi đầu mới",
  },
  {
    kanji: "日進月歩",
    furigana: "にっしんげっぽ",
    romaji: "Nisshin geppo",
    meaning: "Mỗi ngày một bước tiến, mỗi tháng một bước nhảy vọt.",
    tag: "Tiến bộ không ngừng",
  },
  {
    kanji: "温故知新",
    furigana: "おんこちしん",
    romaji: "Onko chishin",
    meaning: "Ôn lại cái cũ để hiểu sâu cái mới. Ôn tập SRS đều đặn để nhớ mãi.",
    tag: "Bí quyết ghi nhớ",
  },
];

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

  // Calculate Weekly XP & Leaderboard Rival
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weeklyTransactions = await prisma.xpTransaction.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    select: { userId: true, amount: true },
  });

  const weeklyXpMap = new Map<string, number>();
  weeklyTransactions.forEach((t) => {
    weeklyXpMap.set(t.userId, (weeklyXpMap.get(t.userId) || 0) + t.amount);
  });

  const allUsersForLeaderboard = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      totalXP: true,
      level: true,
      currentStreak: true,
      profile: { select: { displayName: true, avatar: true } },
    },
    take: 20,
  });

  const formattedUsers = allUsersForLeaderboard.map((u) => ({
    id: u.id,
    name: u.name,
    totalXP: u.totalXP,
    level: u.level,
    currentStreak: u.currentStreak,
    displayName: u.profile?.displayName || u.name,
    avatar: u.profile?.avatar || null,
    weeklyXp: weeklyXpMap.get(u.id) || 0,
  }));

  const { directRival, weeklyList } = buildEnrichedLeaderboard(formattedUsers, uid);
  const userRankInWeekly = weeklyList.findIndex((u) => u.id === uid) + 1;

  // Personalization based on user's goal & level
  const isBeginner = userLevel === "N5" && completedLessonsCount < 2;
  const isTravelGoal = user.learningGoal === "TRAVEL";
  const isConversationGoal = user.learningGoal === "CONVERSATION";

  // Pick deterministic inspiration quote for today
  const dayIndex = new Date().getDate() % DAILY_INSPIRATIONS.length;
  const todayInspiration = DAILY_INSPIRATIONS[dayIndex];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AppNav />

      {/* Top Header Bar: Clean & Welcoming */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="sakura" dot>
              LỘ TRÌNH JLPT {userLevel} · MỤC TIÊU {user.dailyGoalMinutes} PHÚT/NGÀY
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            こんにちは, {user.name || user.email.split("@")[0]}! 🌸
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
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
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-900/80 shadow-sm">
            <span className="text-xl">🔥</span>
            <div>
              <p className="text-xs font-black text-orange-600 dark:text-orange-400 leading-tight">
                {user.currentStreak} ngày liên tiếp
              </p>
              <p className="text-[10px] text-slate-400 font-medium">Kỷ lục: {user.longestStreak} ngày</p>
            </div>
          </div>
          <ActivityButton />
        </div>
      </div>

      {/* Daily Kotoba Inspiration Card (Ignites desire to learn) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sakura-50/80 via-white to-amber-50/80 dark:from-sumi-900 dark:via-sumi-950 dark:to-sumi-900 border border-sakura-200/60 dark:border-slate-800/80 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white dark:bg-sumi-800 flex items-center justify-center text-xl shadow-sm border border-sakura-100 dark:border-slate-700 shrink-0 font-jp font-black text-sakura-600 dark:text-sakura-400">
              語
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-sakura-600 dark:text-sakura-400">
                  {todayInspiration.tag}
                </span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="text-[11px] text-slate-400 font-jp">{todayInspiration.furigana}</span>
              </div>
              <div className="flex flex-wrap items-baseline gap-2 mt-0.5">
                <span className="text-base sm:text-lg font-black font-jp tracking-wide text-slate-900 dark:text-white">
                  {todayInspiration.kanji}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium italic">
                  ({todayInspiration.romaji})
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
                {todayInspiration.meaning}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center justify-end">
            <Badge variant="amber" className="text-[10px]">
              Tập trung & Kiên trì ✨
            </Badge>
          </div>
        </div>
      </div>

      {/* Main 2-Column Bento Workspace Grid for Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =========================================================
            LEFT COLUMN (8 cols): Primary Action & Quick Learning Hub
            ========================================================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* Primary Action Card: Next Lesson Focus */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sumi-900 via-[#181c33] to-slate-950 p-6 sm:p-7 text-white border border-slate-800 shadow-xl">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-sakura-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sakura-500/20 text-sakura-300 border border-sakura-500/30">
                    🎯 TRỌNG TÂM HÔM NAY
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">
                    Bài #{currentLesson ? currentLesson.order + 1 : 1} / {allLessons.length}
                  </span>
                </div>
                <span className="text-xs font-black text-sakura-400">{lessonProgressPercent}% hoàn thành</span>
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
                <div className="h-2 w-full rounded-full bg-slate-800/90 overflow-hidden border border-slate-700/50">
                  <div
                    className="h-full bg-gradient-to-r from-sakura-500 via-rose-500 to-amber-400 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${lessonProgressPercent}%` }}
                  />
                </div>
              </div>

              {/* Primary Action Button */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {currentLesson ? (
                  <Link href={`/app/practice/${currentLesson.slug}`}>
                    <Button variant="sakura" size="md" className="font-black px-6 shadow-lg shadow-sakura-500/30 hover:scale-[1.02]">
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
                TRUNG TÂM LUYỆN TẬP CỐT LÕI
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tile 1: SRS Spaced Repetition */}
              <Link href="/app/review" className="block group">
                <Card
                  hover
                  className="p-5 h-full flex flex-col justify-between border-2 border-indigo-100 hover:border-indigo-300 dark:border-slate-800 dark:hover:border-indigo-800 bg-gradient-to-br from-white via-indigo-50/20 to-white dark:from-sumi-900 dark:via-sumi-950 dark:to-sumi-900"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 flex items-center justify-center text-xl shadow-xs">
                        🎴
                      </div>
                      <Badge variant={dueReviews > 0 ? "sakura" : "matcha"} dot>
                        {dueReviews > 0 ? `${dueReviews} thẻ cần ôn` : "Đã hoàn thành"}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-sakura-600 dark:group-hover:text-sakura-400 transition">
                        Hàng Đợi Ôn Tập (SRS)
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        Chống quên lãng với thuật toán SM-2. ({totalReviewsInSRS} thẻ trong bộ nhớ dài hạn)
                      </p>
                    </div>
                  </div>
                  <div className="pt-3.5 flex items-center text-xs font-black text-sakura-600 dark:text-sakura-400">
                    <span>{dueReviews > 0 ? "Ôn tập ngay bây giờ" : "Xem kho thẻ ôn tập"}</span>
                    <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Card>
              </Link>

              {/* Tile 2: Kana Lab */}
              <Link href="/app/learn" className="block group">
                <Card
                  hover
                  className="p-5 h-full flex flex-col justify-between border-2 border-rose-100 hover:border-rose-300 dark:border-slate-800 dark:hover:border-rose-900 bg-gradient-to-br from-white via-rose-50/20 to-white dark:from-sumi-900 dark:via-sumi-950 dark:to-sumi-900"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-2xl bg-rose-100 dark:bg-rose-950/80 flex items-center justify-center text-xl font-bold font-jp text-sakura-600 shadow-xs">
                        あ
                      </div>
                      <Badge variant="sakura">46 Ký Tự</Badge>
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-sakura-600 dark:group-hover:text-sakura-400 transition">
                        Kana Lab — Bảng Chữ Cái
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        Luyện viết nét Hiragana & Katakana kèm âm thanh chuẩn bản xứ và nét vẽ Canvas.
                      </p>
                    </div>
                  </div>
                  <div className="pt-3.5 flex items-center text-xs font-black text-sakura-600 dark:text-sakura-400">
                    <span>Luyện vẽ bảng chữ cái</span>
                    <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Card>
              </Link>

              {/* Tile 3: Vocab & Kanji Lab */}
              <Link href="/app/vocabulary" className="block group">
                <Card
                  hover
                  className="p-5 h-full flex flex-col justify-between border-2 border-amber-100 hover:border-amber-300 dark:border-slate-800 dark:hover:border-amber-900 bg-gradient-to-br from-white via-amber-50/20 to-white dark:from-sumi-900 dark:via-sumi-950 dark:to-sumi-900"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/80 flex items-center justify-center text-xl font-bold font-jp text-amber-700 shadow-xs">
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
                  <div className="pt-3.5 flex items-center text-xs font-black text-amber-600 dark:text-amber-400">
                    <span>Tra cứu từ vựng & Kanji</span>
                    <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Card>
              </Link>

              {/* Tile 4: Survival Mode */}
              <Link href="/app/survival" className="block group">
                <Card
                  hover
                  className="p-5 h-full flex flex-col justify-between border-2 border-emerald-100 hover:border-emerald-300 dark:border-slate-800 dark:hover:border-emerald-900 bg-gradient-to-br from-white via-emerald-50/20 to-white dark:from-sumi-900 dark:via-sumi-950 dark:to-sumi-900"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-xl shadow-xs">
                        🍜
                      </div>
                      <Badge variant="matcha">Thực Chiến</Badge>
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-sakura-600 dark:group-hover:text-sakura-400 transition">
                        Survival Mode — Sinh Tồn
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        Thử thách phản xạ từ vựng & xử lý tình huống giao tiếp bản xứ theo thời gian thực.
                      </p>
                    </div>
                  </div>
                  <div className="pt-3.5 flex items-center text-xs font-black text-emerald-600 dark:text-emerald-400">
                    <span>Bắt đầu thử thách sinh tồn</span>
                    <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Card>
              </Link>
            </div>

            {/* AI Kaiwa Sensei N3 Highlight Banner */}
            <Link href="/app/sensei" className="block group">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-600 p-5 sm:p-6 text-white shadow-lg shadow-pink-500/20 hover:shadow-xl hover:shadow-pink-500/30 transition-all">
                <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shrink-0 shadow-inner">
                      🌸
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/25 text-white">
                          ✨ TÍNH NĂNG MỚI · JLPT N3
                        </span>
                        <span className="text-xs text-rose-100 font-bold">Khẩu hình & Micro 🎙️</span>
                      </div>
                      <h4 className="font-black text-base sm:text-lg tracking-tight">
                        AI Kaiwa Sensei — Đàm Thoại Trực Tiếp
                      </h4>
                      <p className="text-xs text-rose-100 opacity-95">
                        Luyện nói 2 chiều với Aoi Sensei: Nhận diện giọng nói, khẩu hình tự nhiên & sửa lỗi ngữ pháp.
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <Button variant="gold" size="sm" className="font-black px-5 shadow-md">
                      Trò chuyện ngay 🗣️
                    </Button>
                  </div>
                </div>
              </div>
            </Link>
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
              <span className="text-xs font-extrabold text-slate-500">{user.totalXP.toLocaleString()} XP</span>
            </div>

            <XPBar
              currentXP={user.totalXP}
              nextLevelXP={level.nextLevelXP}
              level={level.level}
              className="mt-3"
            />
          </Card>

          {/* Weekly League Rival Mini Card */}
          {directRival && (
            <Card className="p-5 border border-rose-200 dark:border-rose-900/60 bg-gradient-to-br from-white via-rose-50/20 to-white dark:from-sumi-900 dark:via-sumi-950 dark:to-sumi-900">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">⚔️</span>
                  <h3 className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    ĐUA HẠNG TUẦN NÀY
                  </h3>
                </div>
                <Link href="/app/leaderboard">
                  <span className="text-[11px] font-bold text-sakura-600 dark:text-sakura-400 hover:underline">
                    Hạng #{userRankInWeekly} →
                  </span>
                </Link>
              </div>

              <div className="flex items-center gap-3 py-1">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-lg text-white shadow-sm shrink-0">
                  {directRival.bot.avatar || "⚔️"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                      @{directRival.bot.name}
                    </p>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 shrink-0">
                      ⚡ {directRival.bot.xp} XP
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                    {directRival.message}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  {directRival.bot.studyPace === "EARLY_BIRD"
                    ? "🌅 Học chăm buổi sáng"
                    : directRival.bot.studyPace === "NIGHT_OWL"
                    ? "🌙 Cày đêm bứt phá"
                    : "⚡ Đang leo rank tích cực"}
                </span>
                <Link href="/app/leaderboard">
                  <Button variant="ghost" size="sm" className="text-[11px] py-1 px-2.5 h-auto text-sakura-600 dark:text-sakura-400 font-black">
                    Bảng xếp hạng 🏆
                  </Button>
                </Link>
              </div>
            </Card>
          )}

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
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shadow-xs"
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
