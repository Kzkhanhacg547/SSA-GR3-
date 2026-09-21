import { Prisma } from "@prisma/client";

// Define the exact type that the ReviewClient expects
export interface EnrichedReviewItem {
  id: string;
  contentType: string;
  contentId: string;
  title: string;
  subtitle: string;
  reading: string;
  extra: string;
  interval: number;
  repetitions: number;
}

// Minimal types matching Prisma models to avoid importing heavy generic Prisma types
type ReviewItem = {
  id: string;
  contentType: string;
  contentId: string;
  interval: number;
  repetitions: number;
};

export type ContentMaps = {
  kanaMap: Map<string, { character: string; script: string; romaji: string; ipa: string | null }>;
  vocabMap: Map<string, { word: string; kana: string; romaji: string; meaning: string; partOfSpeech: string }>;
  kanjiMap: Map<string, { character: string; meaning: string; readings: { reading: string }[] }>;
  grammarMap: Map<string, { title: string; meaning: string; structure: string }>;
  exerciseMap: Map<string, { question: string; correctAnswer: string; prompt: string | null }>;
};

/**
 * Resolves raw ReviewItems into EnrichedReviewItems.
 * Filters out any orphan items where the underlying content no longer exists.
 */
export function resolveReviewItems(items: ReviewItem[], maps: ContentMaps): EnrichedReviewItem[] {
  const { kanaMap, vocabMap, kanjiMap, grammarMap, exerciseMap } = maps;

  const enriched: EnrichedReviewItem[] = [];

  for (const item of items) {
    let title = "";
    let subtitle = item.contentType;
    let reading = "";
    let extra = "";
    let isValid = false;

    if (item.contentType === "KANA") {
      const kanaDetail = kanaMap.get(item.contentId);
      if (kanaDetail) {
        title = kanaDetail.character;
        subtitle = kanaDetail.script;
        reading = kanaDetail.romaji;
        extra = kanaDetail.ipa ? `/${kanaDetail.ipa}/` : "";
        isValid = true;
      }
    } else if (item.contentType === "VOCAB") {
      const vocabDetail = vocabMap.get(item.contentId);
      if (vocabDetail) {
        title = vocabDetail.word;
        subtitle = `Từ Vựng · ${vocabDetail.partOfSpeech}`;
        reading = `${vocabDetail.kana} (${vocabDetail.romaji})`;
        extra = vocabDetail.meaning;
        isValid = true;
      }
    } else if (item.contentType === "KANJI") {
      const kanjiDetail = kanjiMap.get(item.contentId);
      if (kanjiDetail) {
        title = kanjiDetail.character;
        subtitle = "Hán Tự JLPT N5";
        reading = kanjiDetail.readings.map((r) => r.reading).join(" · ");
        extra = kanjiDetail.meaning;
        isValid = true;
      }
    } else if (item.contentType === "GRAMMAR") {
      const grammarDetail = grammarMap.get(item.contentId);
      if (grammarDetail) {
        title = grammarDetail.title;
        subtitle = "Ngữ Pháp JLPT N5";
        reading = grammarDetail.structure;
        extra = grammarDetail.meaning;
        isValid = true;
      }
    } else if (item.contentType === "EXERCISE") {
      const exerciseDetail = exerciseMap.get(item.contentId);
      if (exerciseDetail) {
        title = exerciseDetail.question;
        subtitle = "Câu Hỏi Luyện Tập N5";
        reading = `Đáp án: ${exerciseDetail.correctAnswer}`;
        extra = exerciseDetail.prompt || "";
        isValid = true;
      }
    } else if (item.contentId.includes(":")) {
      // Custom generic fallback for composite IDs
      const parts = item.contentId.split(":");
      title = parts[1] || parts[0];
      subtitle = parts[0];
      isValid = true;
    }

    if (isValid) {
      enriched.push({
        id: item.id,
        contentType: item.contentType,
        contentId: item.contentId,
        title,
        subtitle,
        reading,
        extra,
        interval: item.interval,
        repetitions: item.repetitions,
      });
    }
  }

  return enriched;
}
