"use client";

import { useState, useMemo } from "react";
import { Card, Button, Badge } from "@/components/ui";
import { useSoundAndTheme } from "@/components/SoundAndThemeContext";

interface KanjiItem {
  id: string;
  character: string;
  meaning: string;
  strokeCount: number;
  jlptLevel: string;
  readings: Array<{ id: string; reading: string; type: string }>;
}

interface VocabItem {
  id: string;
  word: string;
  kana: string;
  kanji: string | null;
  romaji: string;
  meaning: string;
  partOfSpeech: string;
  jlptLevel: string;
  examples: Array<{ id: string; japanese: string; meaning: string; romaji: string | null }>;
}

const LEVELS = ["N5", "N4", "N3"] as const;

export function VocabKanjiClient({
  vocabulary,
  kanji,
  savedItemIds = [],
  defaultLevel = "N5",
}: {
  vocabulary: VocabItem[];
  kanji: KanjiItem[];
  savedItemIds?: string[];
  defaultLevel?: string;
}) {
  const [tab, setTab] = useState<"VOCAB" | "KANJI">("VOCAB");
  const [levelFilter, setLevelFilter] = useState<string>(defaultLevel);
  const [query, setQuery] = useState("");
  const [savedSet, setSavedSet] = useState<Set<string>>(new Set(savedItemIds));
  const { playClick, playCorrect, showToast } = useSoundAndTheme();

  const handleAddToSrs = async (contentType: "VOCAB" | "KANJI", contentId: string, name: string) => {
    playClick();
    try {
      const res = await fetch("/api/review/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType, contentId }),
      });
      if (res.ok) {
        playCorrect();
        setSavedSet((prev) => new Set(prev).add(contentId));
        showToast({
          title: `Đã lưu thẻ Flashcard: ${name}! 🎴`,
          description: "Mục này đã được đưa vào hàng đợi ôn tập SRS hôm nay!",
          type: "xp",
        });
      }
    } catch {
      showToast({ title: "Không thể lưu thẻ, vui lòng thử lại.", type: "error" });
    }
  };

  const speak = (text: string) => {
    try {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "ja-JP";
        u.rate = 0.85;
        window.speechSynthesis.speak(u);
      }
    } catch {}
  };

  const filteredVocab = useMemo(() => {
    let result = levelFilter === "ALL" ? vocabulary : vocabulary.filter((v) => v.jlptLevel === levelFilter);
    if (!query.trim()) return result;
    const q = query.toLowerCase();
    return result.filter(
      (v) =>
        v.word.toLowerCase().includes(q) ||
        v.kana.toLowerCase().includes(q) ||
        v.romaji.toLowerCase().includes(q) ||
        v.meaning.toLowerCase().includes(q)
    );
  }, [vocabulary, query, levelFilter]);

  const filteredKanji = useMemo(() => {
    let result = levelFilter === "ALL" ? kanji : kanji.filter((k) => k.jlptLevel === levelFilter);
    if (!query.trim()) return result;
    const q = query.toLowerCase();
    return result.filter(
      (k) =>
        k.character.includes(q) ||
        k.meaning.toLowerCase().includes(q) ||
        k.readings.some((r) => r.reading.toLowerCase().includes(q))
    );
  }, [kanji, query, levelFilter]);

  return (
    <div className="space-y-6">
      {/* Level Filter + Tab Switcher */}
      <div className="flex flex-col gap-3 bg-white/80 dark:bg-sumi-900/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        {/* Level Selector Row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-black text-slate-500 uppercase tracking-wider mr-1">Cấp độ:</span>
          {LEVELS.map((lv) => (
            <button
              key={lv}
              onClick={() => { playClick(); setLevelFilter(lv); }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                levelFilter === lv
                  ? "bg-sakura-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-sumi-800 text-slate-600 dark:text-slate-300 hover:bg-sakura-100 dark:hover:bg-sumi-700"
              }`}
            >
              {lv} {lv === "N5" ? "Cơ Bản" : lv === "N4" ? "Sơ Trung Cấp" : "Trung Cấp"}
            </button>
          ))}
          <button
            onClick={() => { playClick(); setLevelFilter("ALL"); }}
            className={`px-3 py-1 rounded-full text-xs font-bold transition ${
              levelFilter === "ALL"
                ? "bg-sumi-900 text-white dark:bg-white dark:text-sumi-900 shadow-sm"
                : "bg-slate-100 dark:bg-sumi-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-sumi-700"
            }`}
          >
            Tất Cả
          </button>
        </div>

        {/* Vocab / Kanji Tab + Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => { playClick(); setTab("VOCAB"); }}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-bold transition ${
                tab === "VOCAB"
                  ? "bg-sakura-600 text-white shadow-md shadow-sakura-600/30"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              📖 Từ Vựng ({filteredVocab.length})
            </button>
            <button
              onClick={() => { playClick(); setTab("KANJI"); }}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-bold transition ${
                tab === "KANJI"
                  ? "bg-sakura-600 text-white shadow-md shadow-sakura-600/30"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              漢 Hán Tự ({filteredKanji.length})
            </button>
          </div>

          {/* Search input */}
          <div className="relative w-full sm:w-72">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tra cứu từ vựng, romaji, nghĩa..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-sumi-950 text-slate-900 dark:text-white outline-none focus:border-sakura-500"
            />
          </div>
        </div>
      </div>

      {/* VOCABULARY VIEW */}
      {tab === "VOCAB" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredVocab.map((v) => (
            <Card key={v.id} hover className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="jp-text text-2xl font-black text-slate-900 dark:text-white">
                        {v.word}
                      </h3>
                      <button
                        onClick={() => speak(v.word)}
                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-sumi-800 text-slate-500"
                        title="Nghe phát âm"
                      >
                        🔊
                      </button>
                    </div>
                    <p className="text-xs font-bold text-sakura-600 dark:text-sakura-400 mt-0.5">
                      {v.kana} · <span className="text-slate-400 font-mono">{v.romaji}</span>
                    </p>
                  </div>
                  <Badge variant="fuji">{v.jlptLevel}</Badge>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {v.meaning}
                  </p>
                  <span className="inline-block text-[10px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-sumi-800 px-2 py-0.5 rounded mt-1">
                    {v.partOfSpeech}
                  </span>
                </div>

                {v.examples.length > 0 && (
                  <div className="mt-3 bg-slate-50 dark:bg-sumi-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="jp-text font-bold text-slate-800 dark:text-slate-200 text-sm">
                        {v.examples[0].japanese}
                      </p>
                      <button
                        onClick={() => speak(v.examples[0].japanese)}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5"
                        title="Nghe câu ví dụ"
                      >
                        🔊
                      </button>
                    </div>
                    {v.examples[0].romaji && (
                      <p className="text-[11px] font-semibold text-sakura-600 dark:text-sakura-400">
                        {v.examples[0].romaji}
                      </p>
                    )}
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      👉 {v.examples[0].meaning}
                    </p>
                  </div>
                )}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400">Thẻ Ôn Tập:</span>
                  <button
                    onClick={() => handleAddToSrs("VOCAB", v.id, v.word)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      savedSet.has(v.id)
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                        : "bg-sakura-50 text-sakura-700 hover:bg-sakura-100 dark:bg-sakura-950/40 dark:text-sakura-300 border border-sakura-200 dark:border-sakura-900"
                    }`}
                  >
                    {savedSet.has(v.id) ? "✓ Đã lưu SRS" : "🔖 Lưu vào SRS"}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* KANJI VIEW */}
      {tab === "KANJI" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredKanji.map((k) => (
            <Card key={k.id} hover className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="jp-text text-5xl font-black text-rose-600 dark:text-rose-400">
                      {k.character}
                    </span>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                        {k.meaning}
                      </h3>
                      <span className="text-xs text-slate-400">
                        {k.strokeCount} nét viết
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => speak(k.character)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-sumi-800 text-slate-500"
                    title="Nghe phát âm"
                  >
                    🔊
                  </button>
                </div>

                {/* Readings: Onyomi & Kunyomi */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-400 block text-[10px] uppercase">
                      Âm On (Onyomi):
                    </span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {k.readings
                        .filter((r) => r.type === "ONYOMI")
                        .map((r) => (
                          <span
                            key={r.id}
                            className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold"
                          >
                            {r.reading}
                          </span>
                        ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-slate-400 block text-[10px] uppercase">
                      Âm Kun (Kunyomi):
                    </span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {k.readings
                        .filter((r) => r.type === "KUNYOMI")
                        .map((r) => (
                          <span
                            key={r.id}
                            className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-fuji-600 dark:text-indigo-300 font-bold"
                          >
                            {r.reading}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400">Thẻ Ôn Tập:</span>
                  <button
                    onClick={() => handleAddToSrs("KANJI", k.id, k.character)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      savedSet.has(k.id)
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                        : "bg-sakura-50 text-sakura-700 hover:bg-sakura-100 dark:bg-sakura-950/40 dark:text-sakura-300 border border-sakura-200 dark:border-sakura-900"
                    }`}
                  >
                    {savedSet.has(k.id) ? "✓ Đã lưu SRS" : "🔖 Lưu vào SRS"}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
