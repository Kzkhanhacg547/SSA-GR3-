import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { AppNav } from "@/components/AppNav";
import { PageTitle, Button } from "@/components/ui";
import { PracticeClient, type UnitInfo, type PracticeLessonItem } from "./PracticeClient";
import Link from "next/link";

export const metadata = {
  title: "Khóa Học & Luyện Tập JLPT — Nihon Quest",
};

const UNITS_BY_LEVEL: Record<string, UnitInfo[]> = {
  N5: [
    { number: 1, title: "Unit 01: Nhập Môn & Chào Hỏi", description: "Bảng chữ cái Kana, câu chào hỏi hàng ngày, số đếm và giới thiệu bản thân", icon: "🌱", startIndex: 0, endIndex: 5 },
    { number: 2, title: "Unit 02: Cuộc Sống Thường Ngày", description: "Thời gian, đồ vật quanh ta, nhà ở, ẩm thực và các hoạt động thường nhật", icon: "🍱", startIndex: 5, endIndex: 10 },
    { number: 3, title: "Unit 03: Mua Sắm & Ẩm Thực", description: "Hỏi giá, mua sắm tại cửa hàng tiện lợi Konbini, gọi món tại quán ăn Nhật Bản", icon: "🏪", startIndex: 10, endIndex: 15 },
    { number: 4, title: "Unit 04: Giao Thông & Du Lịch", description: "Hỏi đường tại đại nhà ga, phương tiện đi lại, lữ quán Ryokan và bốn mùa Nhật Bản", icon: "🚅", startIndex: 15, endIndex: 20 },
    { number: 5, title: "Unit 05: Giao Tiếp Nâng Cao", description: "Bày tỏ cảm xúc, rủ rê hẹn gặp, thể Te và các cấu trúc ngữ pháp N5 thực chiến", icon: "🏯", startIndex: 20, endIndex: 30 },
  ],
  N4: [
    { number: 1, title: "Unit 01: Biến Thể Động Từ", description: "Thể てしまう, やすい/にくい, すぎる và các biến thể động từ sơ trung cấp", icon: "🗂️", startIndex: 0, endIndex: 2 },
    { number: 2, title: "Unit 02: Câu Điều Kiện", description: "Bốn dạng câu giả định: ば, たら, なら, と — phân biệt và sử dụng đúng ngữ cảnh", icon: "🔄", startIndex: 2, endIndex: 4 },
    { number: 3, title: "Unit 03: Bị Động & Sai Khiến", description: "Thể Bị động (受身), Thể Sai khiến và Mẫu câu xin phép nơi công sở", icon: "🏢", startIndex: 4, endIndex: 6 },
  ],
  N3: [
    { number: 1, title: "Unit 01: Giao Tiếp Công Sở", description: "Văn hóa Horenso, báo cáo tiến độ và sử dụng に関して trong môi trường công việc", icon: "💼", startIndex: 0, endIndex: 1 },
    { number: 2, title: "Unit 02: Diễn Đạt Sắc Thái", description: "わけがない, に違いない và các cấu trúc diễn đạt sự chắc chắn, phủ định mạnh", icon: "🎯", startIndex: 1, endIndex: 2 },
    { number: 3, title: "Unit 03: Thời Điểm & Thời Gian", description: "たとたん, うちに — nắm bắt khoảnh khắc và sử dụng đúng thời điểm", icon: "⏳", startIndex: 2, endIndex: 4 },
  ],
};

export default async function PracticePage() {
  const session = await getServerSession(authOptions);
  const uid = (session?.user as { id?: string } | undefined)?.id;
  if (!uid) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: uid }, select: { learningLevel: true } });
  const userLevel = user?.learningLevel ?? "N5";

  const allLessons = await prisma.lesson.findMany({
    where: { isPublished: true },
    orderBy: { order: "asc" },
    include: { progress: { where: { userId: uid } }, _count: { select: { exercises: true } } },
  });

  // Filter lessons for user's current level
  const lessons = allLessons.filter((l) => l.level === userLevel);
  const completedCount = lessons.filter((l) => l.progress[0]?.status === "COMPLETED").length;
  const progressPercent = Math.round((completedCount / Math.max(1, lessons.length)) * 100);
  const nextLesson = lessons.find((l) => l.progress[0]?.status !== "COMPLETED") || lessons[0];

  const UNITS = UNITS_BY_LEVEL[userLevel] ?? UNITS_BY_LEVEL["N5"];

  const LEVEL_DESCS: Record<string, string> = {
    N5: "Hệ thống bài học cơ bản từ Kana đến giao tiếp hàng ngày kèm trắc nghiệm phản xạ.",
    N4: "Lộ trình sơ trung cấp: Biến thể động từ, câu điều kiện, bị động và sai khiến thực chiến.",
    N3: "Ngữ pháp trung cấp: Diễn đạt sắc thái, thời điểm và giao tiếp nơi công sở chuyên nghiệp.",
  };

  const serializedLessons: PracticeLessonItem[] = lessons.map((l) => ({
    id: l.id,
    order: l.order,
    slug: l.slug,
    title: l.title,
    description: l.description,
    xpReward: l.xpReward,
    level: l.level,
    exercisesCount: l._count.exercises,
    progressStatus: l.progress[0]?.status as "COMPLETED" | "IN_PROGRESS" | undefined,
    score: l.progress[0]?.score,
  }));

  return (
    <div className="space-y-6">
      <AppNav />
      <PageTitle
        title={`Lộ Trình Học Tiếng Nhật ${userLevel}`}
        subtitle={LEVEL_DESCS[userLevel] ?? LEVEL_DESCS["N5"]}
        badge={`${completedCount} / ${lessons.length} bài hoàn thành`}
      />

      {/* Progress & Next Step Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-sakura-600 via-rose-600 to-indigo-900 p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20">
              TIẾN ĐỘ LỘ TRÌNH JLPT {userLevel}
            </span>
            <h2 className="text-xl sm:text-2xl font-black">
              {progressPercent === 100 ? `🎉 Bạn đã hoàn thành toàn bộ khóa học ${userLevel}!` : "Tiếp tục hành trình học tập!"}
            </h2>
            <p className="text-xs text-rose-100 opacity-95">
              Đã hoàn thành {completedCount} / {lessons.length} bài học ({progressPercent}%).
            </p>
            {/* Progress bar */}
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden mt-2 max-w-md">
              <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          {nextLesson && (
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 shrink-0 w-full md:w-auto min-w-[220px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                BÀI HỌC TIẾP THEO
              </span>
              <p className="font-black text-xs sm:text-sm text-white mt-0.5 truncate max-w-[220px]">
                {nextLesson.title}
              </p>
              <Link href={`/app/practice/${nextLesson.slug}`} className="block mt-2.5">
                <Button variant="gold" size="sm" className="w-full justify-center font-black text-xs">
                  Học bài này ngay →
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Tabbed Practice Client */}
      <PracticeClient
        lessons={serializedLessons}
        units={UNITS}
        userLevel={userLevel}
      />
    </div>
  );
}
