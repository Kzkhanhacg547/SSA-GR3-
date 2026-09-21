import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { AppNav } from "@/components/AppNav";
import { PageTitle } from "@/components/ui";
import { ReviewClient } from "./ReviewClient";
import { resolveReviewItems } from "@/lib/review/resolveReviewItem";

export default async function ReviewPage() {
  const session = await getServerSession(authOptions);
  const uid = (session?.user as { id?: string } | undefined)?.id;
  if (!uid) redirect("/login");

  const items = await prisma.reviewItem.findMany({
    where: { userId: uid, dueAt: { lte: new Date() } },
    orderBy: { dueAt: "asc" },
    take: 30,
  });

  // Fetch dictionary data for lookup in reviews
  const allKana = await prisma.kana.findMany({
    select: { character: true, script: true, romaji: true, ipa: true, row: true },
  });

  const kanaMap = new Map<string, { character: string; script: string; romaji: string; ipa: string | null }>();
  allKana.forEach((k) => {
    kanaMap.set(`${k.script}:${k.character}`, k);
    kanaMap.set(k.character, k);
  });

  const allVocab = await prisma.vocabulary.findMany({
    select: { id: true, word: true, kana: true, romaji: true, meaning: true, partOfSpeech: true },
  });
  const vocabMap = new Map(allVocab.map((v) => [v.id, v]));

  const allKanji = await prisma.kanji.findMany({
    select: { id: true, character: true, meaning: true, readings: true },
  });
  const kanjiMap = new Map(allKanji.map((k) => [k.id, k]));

  const allGrammar = await prisma.grammar.findMany({
    select: { id: true, title: true, meaning: true, structure: true },
  });
  const grammarMap = new Map(allGrammar.map((g) => [g.id, g]));

  const allExercises = await prisma.exercise.findMany({
    select: { id: true, question: true, correctAnswer: true, prompt: true, type: true },
  });
  const exerciseMap = new Map(allExercises.map((e) => [e.id, e]));

  // Map review items with detail data using helper
  const enrichedItems = resolveReviewItems(items, {
    kanaMap,
    vocabMap,
    kanjiMap,
    grammarMap,
    exerciseMap,
  });

  return (
    <div className="space-y-6">
      <AppNav />
      <PageTitle
        title="Ôn Tập Lặp Lại Cách Khoảng (SRS)"
        subtitle="Hệ thống Spaced Repetition thông minh giúp củng cố kiến thức vào bộ nhớ dài hạn."
        badge={`${enrichedItems.length} thẻ cần ôn`}
      />
      <ReviewClient initial={enrichedItems} />
    </div>
  );
}
