import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { AppNav } from "@/components/AppNav";
import { PageTitle } from "@/components/ui";
import { VocabKanjiClient } from "./VocabKanjiClient";

export default async function VocabularyPage() {
  const session = await getServerSession(authOptions);
  const uid = (session?.user as { id?: string } | undefined)?.id;
  if (!uid) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: uid }, select: { learningLevel: true } });
  const userLevel = user?.learningLevel ?? "N5";

  const vocabulary = await prisma.vocabulary.findMany({
    orderBy: { word: "asc" },
    include: { examples: true },
  });

  const kanji = await prisma.kanji.findMany({
    orderBy: { strokeCount: "asc" },
    include: { readings: true },
  });

  const userReviews = await prisma.reviewItem.findMany({
    where: { userId: uid, contentType: { in: ["VOCAB", "KANJI"] } },
    select: { contentId: true },
  });
  const savedItemIds = userReviews.map((r) => r.contentId);

  const LEVEL_LABELS: Record<string, string> = { N5: "N5 Cơ Bản", N4: "N4 Sơ Trung Cấp", N3: "N3 Trung Cấp", N2: "N2 Nâng Cao", N1: "N1 Cao Cấp" };

  return (
    <div className="space-y-6">
      <AppNav />
      <PageTitle
        title={`Kho Từ Vựng & Hán Tự`}
        subtitle={`Tra cứu, học nghĩa và cách phát âm từ vựng và chữ Hán theo lộ trình JLPT cá nhân hoá của bạn.`}
        badge={LEVEL_LABELS[userLevel] ?? userLevel}
      />
      <VocabKanjiClient
        vocabulary={JSON.parse(JSON.stringify(vocabulary))}
        kanji={JSON.parse(JSON.stringify(kanji))}
        savedItemIds={savedItemIds}
        defaultLevel={userLevel}
      />
    </div>
  );
}
