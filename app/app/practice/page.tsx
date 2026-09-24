import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { AppNav } from "@/components/AppNav";
import { PageTitle, Button } from "@/components/ui";
import { PracticeClient, type UnitInfo, type PracticeLessonItem } from "./PracticeClient";
import Link from "next/link";

function cleanLessonTitle(title: string): string {
  if (!title) return "";
  return title.replace(/^(Minna\s+)?Bài\s*\d+(\s*\([^\)]+\))?:\s*/i, "").trim();
}

export const metadata = {
  title: "Khóa Học & Luyện Tập JLPT — Nihon Quest",
};

const UNITS_BY_LEVEL: Record<string, UnitInfo[]> = {
  N5: [
    { number: 1, title: "Unit 01: Nhập Môn, Kana & Chào Hỏi", description: "Bảng chữ cái Hiragana, Katakana, biến âm, ảo âm, văn hóa chào hỏi & làm quen giao tiếp", icon: "🌱", startIndex: 0, endIndex: 10 },
    { number: 2, title: "Unit 02: Đồ Vật, Nơi Chốn & Hoạt Động", description: "Chỉ thị từ Kore/Sore/Are, địa điểm, thời gian, động từ di chuyển & các cặp tính từ sơ cấp", icon: "🍱", startIndex: 10, endIndex: 20 },
    { number: 3, title: "Unit 03: Tồn Tại, So Sánh & Thể Te", description: "Tồn tại Arimasu/Imasu, số đếm, so sánh hơn nhất, nguyện vọng & bí quyết chia Thể Te", icon: "🏪", startIndex: 20, endIndex: 30 },
    { number: 4, title: "Unit 04: Thể Nai, Ta, Thể Thường & Định Ngữ", description: "Mẫu câu cấm đoán, bắt buộc làm, thể từ điển, kinh nghiệm từng trải & mệnh đề bổ ngữ danh từ", icon: "⛩️", startIndex: 30, endIndex: 40 },
    { number: 5, title: "Unit 05: Kanji Master & Mock Test JLPT N5", description: "100+ Kanji cốt lõi, 10 trợ từ then chốt, phản xạ 5 thể động từ, đọc hiểu & đề thi thử toàn diện", icon: "🏆", startIndex: 40, endIndex: 50 },
  ],
  N4: [
    { number: 1, title: "Unit 01: Biến Thể Động Từ & Thể Trạng Thái", description: "Thể てしまう, やすい/にくい, すぎる và các biến thể động từ sơ trung cấp", icon: "🗂️", startIndex: 0, endIndex: 5 },
    { number: 2, title: "Unit 02: Câu Điều Kiện & Giả Định", description: "Bốn dạng câu giả định: ば, たら, なら, と — phân biệt và sử dụng đúng ngữ cảnh", icon: "🔄", startIndex: 5, endIndex: 10 },
    { number: 3, title: "Unit 03: Bị Động, Sai Khiến & Xin Phép", description: "Thể Bị động (受身), Thể Sai khiến và Mẫu câu xin phép nơi công sở", icon: "🏢", startIndex: 10, endIndex: 15 },
    { number: 4, title: "Unit 04: Cho Nhận & Diễn Đạt Ý Định", description: "Mẫu câu cho nhận あげる/もらう/くれる, khuyên nhủ ほうがいい và suy đoán", icon: "🎁", startIndex: 15, endIndex: 20 },
    { number: 5, title: "Unit 05: Kanji N4 & Đề Thi Thử JLPT N4", description: "Kanji sơ trung cấp, tổng hợp ngữ pháp N4, đọc hiểu & đề thi thử JLPT N4 toàn diện", icon: "🏅", startIndex: 20, endIndex: 25 },
  ],
  N3: [
    { number: 1, title: "Unit 01: Giao Tiếp Công Sở & Khẳng Định Logic", description: "Văn hóa Horenso công sở, に関して, わけがない, に違いない và khẳng định chắc chắn", icon: "💼", startIndex: 0, endIndex: 5 },
    { number: 2, title: "Unit 02: Thời Điểm, Nguyên Nhân & Mức Độ", description: "たとたん, うちに, おかげで, せいで, に比べて và diễn đạt mức độ so sánh", icon: "⏳", startIndex: 5, endIndex: 10 },
    { number: 3, title: "Unit 03: Phủ Định, Trạng Thái & Kính Ngữ N3", description: "わけではない, つつある, っぱなし, thụ động sai khiến và kính ngữ giao tiếp N3", icon: "🎯", startIndex: 10, endIndex: 15 },
    { number: 4, title: "Unit 04: Kanji Master N3 (Xã Hội & Công Việc)", description: "Bộ Kanji N3 cốt lõi về chính trị, kinh tế, công sở, kỹ thuật và đăng ký", icon: "🈁", startIndex: 15, endIndex: 20 },
    { number: 5, title: "Unit 05: Từ Vựng, Đọc Hiểu & Đề Thi Thử N3", description: "Động từ N3 tần suất cao, tính từ, đọc hiểu email công việc & đề thi thử JLPT N3", icon: "🏆", startIndex: 20, endIndex: 25 },
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
                {cleanLessonTitle(nextLesson.title)}
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
