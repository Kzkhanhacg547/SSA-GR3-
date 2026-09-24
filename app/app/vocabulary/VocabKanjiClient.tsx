"use client";

import { useState, useMemo, useEffect, Fragment } from "react";
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
  tags?: string;
  examples: Array<{ id: string; japanese: string; meaning: string; romaji: string | null }>;
}

const LEVELS = ["N5", "N4", "N3"] as const;
type ViewMode = "GRID" | "TABLE" | "FLASHCARD" | "TOPIC";

const POS_MAP: Record<string, string> = {
  ALL: "Tất cả từ loại",
  noun: "Danh từ",
  verb: "Động từ",
  adjective: "Tính từ -i",
  "na-adjective": "Tính từ -na",
  expression: "Cụm từ / Giao tiếp",
  pronoun: "Đại từ",
};

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
  const [viewMode, setViewMode] = useState<ViewMode>("GRID");
  const [posFilter, setPosFilter] = useState<string>("ALL");
  const [tagFilter, setTagFilter] = useState<string>("ALL");
  const [srsOnlyFilter, setSrsOnlyFilter] = useState<boolean>(false);
  const [query, setQuery] = useState("");

  const [savedSet, setSavedSet] = useState<Set<string>>(new Set(savedItemIds));
  const [masteredSet, setMasteredSet] = useState<Set<string>>(new Set());

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(12);

  // Flashcard mode states
  const [flashcardIndex, setFlashcardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Table expanded row state
  const [tableExpandedId, setTableExpandedId] = useState<string | null>(null);

  // Topic expanded state
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  const { playClick, playCorrect, showToast, speak } = useSoundAndTheme();

  const toggleTopicExpand = (topicTitle: string) => {
    playClick();
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicTitle)) next.delete(topicTitle);
      else next.add(topicTitle);
      return next;
    });
  };

  // Reset page & flashcard index when filters change
  useEffect(() => {
    setCurrentPage(1);
    setFlashcardIndex(0);
    setIsFlipped(false);
  }, [levelFilter, tab, posFilter, tagFilter, srsOnlyFilter, query, viewMode]);

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
          description: "Mục này đã được đưa vào hàng đợi ôn tập SRS!",
          type: "xp",
        });
      }
    } catch {
      showToast({ title: "Không thể lưu thẻ, vui lòng thử lại.", type: "error" });
    }
  };

  const toggleMastered = (id: string) => {
    playClick();
    setMasteredSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Filter Vocabulary
  const filteredVocab = useMemo(() => {
    let result = levelFilter === "ALL" ? vocabulary : vocabulary.filter((v) => v.jlptLevel === levelFilter);

    if (posFilter !== "ALL") {
      result = result.filter((v) => v.partOfSpeech === posFilter);
    }

    if (tagFilter !== "ALL") {
      result = result.filter((v) => v.tags && v.tags.includes(tagFilter));
    }

    if (srsOnlyFilter) {
      result = result.filter((v) => savedSet.has(v.id));
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (v) =>
          v.word.toLowerCase().includes(q) ||
          v.kana.toLowerCase().includes(q) ||
          v.romaji.toLowerCase().includes(q) ||
          v.meaning.toLowerCase().includes(q) ||
          (v.tags && v.tags.toLowerCase().includes(q))
      );
    }
    return result;
  }, [vocabulary, query, levelFilter, posFilter, tagFilter, srsOnlyFilter, savedSet]);

  // Filter Kanji
  const filteredKanji = useMemo(() => {
    let result = levelFilter === "ALL" ? kanji : kanji.filter((k) => k.jlptLevel === levelFilter);

    if (srsOnlyFilter) {
      result = result.filter((k) => savedSet.has(k.id));
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (k) =>
          k.character.includes(q) ||
          k.meaning.toLowerCase().includes(q) ||
          k.readings.some((r) => r.reading.toLowerCase().includes(q))
      );
    }
    return result;
  }, [kanji, query, levelFilter, srsOnlyFilter, savedSet]);

  // Available unique tags for current vocabulary pool
  const availableTags = useMemo(() => {
    const tagsSet = new Set<string>();
    vocabulary.forEach((v) => {
      if (v.tags) {
        v.tags.split(",").forEach((t) => {
          const trimmed = t.trim();
          if (trimmed) tagsSet.add(trimmed);
        });
      }
    });
    return Array.from(tagsSet);
  }, [vocabulary]);

  // Topic Groupings
  const topicGroups = useMemo(() => {
    const groups: Record<string, VocabItem[]> = {
      "💬 Giao tiếp & Chào hỏi": [],
      "🏠 Gia đình & Đời sống": [],
      "🍣 Món ăn & Nhà hàng": [],
      "💼 Trường học & Công việc": [],
      "🚗 Giao thông & Di chuyển": [],
      "☀️ Thời gian & Thời tiết": [],
      "🏃 Động từ thông dụng": [],
      "🎨 Tính từ & Trạng thái": [],
      "📦 Khác": [],
    };

    filteredVocab.forEach((v) => {
      const tag = v.tags || "";
      const pos = v.partOfSpeech || "";

      if (tag.includes("Giao tiếp") || pos === "expression") {
        groups["💬 Giao tiếp & Chào hỏi"].push(v);
      } else if (tag.includes("Gia đình") || tag.includes("Đời sống")) {
        groups["🏠 Gia đình & Đời sống"].push(v);
      } else if (tag.includes("Ăn uống")) {
        groups["🍣 Món ăn & Nhà hàng"].push(v);
      } else if (tag.includes("Công việc") || tag.includes("Học tập")) {
        groups["💼 Trường học & Công việc"].push(v);
      } else if (tag.includes("Giao thông") || tag.includes("Địa điểm")) {
        groups["🚗 Giao thông & Di chuyển"].push(v);
      } else if (tag.includes("Thời tiết") || tag.includes("Thời gian")) {
        groups["☀️ Thời gian & Thời tiết"].push(v);
      } else if (pos === "verb" || tag.includes("Động từ")) {
        groups["🏃 Động từ thông dụng"].push(v);
      } else if (pos.includes("adjective") || tag.includes("Tính từ")) {
        groups["🎨 Tính từ & Trạng thái"].push(v);
      } else {
        groups["📦 Khác"].push(v);
      }
    });

    return groups;
  }, [filteredVocab]);

  // Pagination Logic
  const totalItems = tab === "VOCAB" ? filteredVocab.length : filteredKanji.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const currentVocabSlice = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVocab.slice(start, start + itemsPerPage);
  }, [filteredVocab, currentPage, itemsPerPage]);

  const currentKanjiSlice = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredKanji.slice(start, start + itemsPerPage);
  }, [filteredKanji, currentPage, itemsPerPage]);

  return (
    <div className="space-y-6">
      {/* Level Filter + Tab Switcher + View Mode Control Panel */}
      <div className="flex flex-col gap-4 bg-white/90 dark:bg-sumi-900/90 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
        {/* Row 1: Level Selector */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider mr-1">Cấp độ JLPT:</span>
            {LEVELS.map((lv) => (
              <button
                key={lv}
                onClick={() => {
                  playClick();
                  setLevelFilter(lv);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all duration-200 ${
                  levelFilter === lv
                    ? "bg-sakura-600 text-white shadow-md shadow-sakura-600/30 scale-105"
                    : "bg-slate-100 dark:bg-sumi-800 text-slate-700 dark:text-slate-300 hover:bg-sakura-100 dark:hover:bg-sumi-700"
                }`}
              >
                {lv} {lv === "N5" ? "Sơ Cấp 1" : lv === "N4" ? "Sơ Cấp 2" : "Trung Cấp"}
              </button>
            ))}
            <button
              onClick={() => {
                playClick();
                setLevelFilter("ALL");
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all duration-200 ${
                levelFilter === "ALL"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md scale-105"
                  : "bg-slate-100 dark:bg-sumi-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-sumi-700"
              }`}
            >
              Tất Cả Cấp Độ
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playClick();
                setSrsOnlyFilter(!srsOnlyFilter);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                srsOnlyFilter
                  ? "bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-300"
                  : "bg-slate-50 border-slate-200 dark:bg-sumi-950 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-amber-300"
              }`}
            >
              🔖 Chỉ Thẻ Đã Lưu SRS ({savedSet.size})
            </button>
          </div>
        </div>

        {/* Row 2: Vocab / Kanji Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                playClick();
                setTab("VOCAB");
              }}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-2xl text-sm font-black transition-all ${
                tab === "VOCAB"
                  ? "bg-sakura-600 text-white shadow-md shadow-sakura-600/30"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              📖 Từ Vựng ({filteredVocab.length})
            </button>
            <button
              onClick={() => {
                playClick();
                setTab("KANJI");
              }}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-2xl text-sm font-black transition-all ${
                tab === "KANJI"
                  ? "bg-sakura-600 text-white shadow-md shadow-sakura-600/30"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              漢 Hán Tự ({filteredKanji.length})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tra từ vựng, hán tự, romaji, nghĩa..."
              className="w-full pl-9 pr-8 py-2.5 rounded-2xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-sumi-950 text-slate-900 dark:text-white outline-none focus:border-sakura-500 focus:ring-2 focus:ring-sakura-500/20"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Row 3: VIEW MODE SWITCHER + Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          {/* View Modes (Mobile Scrollable) */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-sumi-950 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-x-auto max-w-full whitespace-nowrap scrollbar-none">
            <button
              onClick={() => {
                playClick();
                setViewMode("GRID");
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shrink-0 ${
                viewMode === "GRID"
                  ? "bg-white dark:bg-sumi-800 text-sakura-600 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              🃏 Thẻ Lưới
            </button>
            <button
              onClick={() => {
                playClick();
                setViewMode("TABLE");
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shrink-0 ${
                viewMode === "TABLE"
                  ? "bg-white dark:bg-sumi-800 text-sakura-600 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              📊 Bảng Tra Cứu
            </button>
            <button
              onClick={() => {
                playClick();
                setViewMode("FLASHCARD");
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shrink-0 ${
                viewMode === "FLASHCARD"
                  ? "bg-white dark:bg-sumi-800 text-sakura-600 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              📇 Flashcard Slide
            </button>
            {tab === "VOCAB" && (
              <button
                onClick={() => {
                  playClick();
                  setViewMode("TOPIC");
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shrink-0 ${
                  viewMode === "TOPIC"
                    ? "bg-white dark:bg-sumi-800 text-sakura-600 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                🏷️ Theo Chủ Đề
              </button>
            )}
          </div>

          {/* POS Filter & Tag Filter dropdowns for VOCAB */}
          {tab === "VOCAB" && viewMode !== "TOPIC" && (
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={posFilter}
                onChange={(e) => setPosFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-sumi-950 text-slate-700 dark:text-slate-200 outline-none"
              >
                {Object.entries(POS_MAP).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>

              {availableTags.length > 0 && (
                <select
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-sumi-950 text-slate-700 dark:text-slate-200 outline-none"
                >
                  <option value="ALL">Tất cả chủ đề</option>
                  {availableTags.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>
      </div>

      {/* VIEW MODE 1: GRID VIEW (THẺ LƯỚI - CÓ PHÂN TRANG) */}
      {viewMode === "GRID" && tab === "VOCAB" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {currentVocabSlice.map((v) => (
              <Card key={v.id} hover className="flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="jp-text text-2xl font-black text-slate-900 dark:text-white">{v.word}</h3>
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
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="fuji">{v.jlptLevel}</Badge>
                      {v.tags && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          {v.tags.split(",")[0]}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{v.meaning}</p>
                    <span className="inline-block text-[10px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-sumi-800 px-2 py-0.5 rounded mt-1">
                      {POS_MAP[v.partOfSpeech] || v.partOfSpeech}
                    </span>
                  </div>

                  {v.examples.length > 0 && (
                    <div className="mt-3 bg-slate-50 dark:bg-sumi-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="jp-text font-bold text-slate-800 dark:text-slate-200 text-sm">{v.examples[0].japanese}</p>
                        <button
                          onClick={() => speak(v.examples[0].japanese)}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5"
                          title="Nghe câu ví dụ"
                        >
                          🔊
                        </button>
                      </div>
                      {v.examples[0].romaji && (
                        <p className="text-[11px] font-semibold text-sakura-600 dark:text-sakura-400">{v.examples[0].romaji}</p>
                      )}
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">👉 {v.examples[0].meaning}</p>
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => toggleMastered(v.id)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-xl transition ${
                        masteredSet.has(v.id)
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300"
                          : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      }`}
                    >
                      {masteredSet.has(v.id) ? "✓ Đã thuộc" : "○ Đánh dấu thuộc"}
                    </button>
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between flex-wrap gap-3 bg-white/80 dark:bg-sumi-900/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500">
                Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredVocab.length)} /{" "}
                {filteredVocab.length} từ
              </span>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => {
                    playClick();
                    setCurrentPage((p) => Math.max(p - 1, 1));
                  }}
                >
                  ◄ Trang trước
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .map((p, idx, arr) => (
                      <span key={p} className="flex items-center">
                        {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-slate-400 text-xs px-1">...</span>}
                        <button
                          onClick={() => {
                            playClick();
                            setCurrentPage(p);
                          }}
                          className={`w-8 h-8 rounded-xl text-xs font-extrabold transition ${
                            currentPage === p
                              ? "bg-sakura-600 text-white shadow-sm"
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-sumi-800"
                          }`}
                        >
                          {p}
                        </button>
                      </span>
                    ))}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    playClick();
                    setCurrentPage((p) => Math.min(p + 1, totalPages));
                  }}
                >
                  Trang sau ►
                </Button>
              </div>

              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-2.5 py-1 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-sumi-950 text-slate-700 dark:text-slate-300"
              >
                <option value={12}>12 từ / trang</option>
                <option value={24}>24 từ / trang</option>
                <option value={48}>48 từ / trang</option>
              </select>
            </div>
          )}
        </>
      )}

      {/* GRID VIEW FOR KANJI */}
      {viewMode === "GRID" && tab === "KANJI" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {currentKanjiSlice.map((k) => (
              <Card key={k.id} hover className="flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="jp-text text-5xl font-black text-rose-600 dark:text-rose-400">{k.character}</span>
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{k.meaning}</h3>
                        <span className="text-xs text-slate-400">{k.strokeCount} nét viết</span>
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

                  {/* Readings */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                    <div>
                      <span className="font-bold text-slate-400 block text-[10px] uppercase">Âm On (Onyomi):</span>
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
                      <span className="font-bold text-slate-400 block text-[10px] uppercase">Âm Kun (Kunyomi):</span>
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

          {totalPages > 1 && (
            <div className="flex items-center justify-between flex-wrap gap-3 bg-white/80 dark:bg-sumi-900/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500">
                Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredKanji.length)} /{" "}
                {filteredKanji.length} Hán tự
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => {
                    playClick();
                    setCurrentPage((p) => Math.max(p - 1, 1));
                  }}
                >
                  ◄ Trang trước
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    playClick();
                    setCurrentPage((p) => Math.min(p + 1, totalPages));
                  }}
                >
                  Trang sau ►
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* VIEW MODE 2: TABLE VIEW (BẢNG TRA CỨU TINH GỌN MẬT ĐỘ CAO) */}
      {viewMode === "TABLE" && (
        <div className="bg-white/95 dark:bg-sumi-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-sumi-950 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-extrabold border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4">Từ vựng / Hán tự</th>
                  <th className="py-3 px-4">Cách đọc (Kana / Romaji)</th>
                  <th className="py-3 px-4">{tab === "VOCAB" ? "Từ loại" : "Nét viết"}</th>
                  <th className="py-3 px-4">Ý nghĩa</th>
                  <th className="py-3 px-4">Cấp độ</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {tab === "VOCAB"
                  ? currentVocabSlice.map((v) => (
                      <Fragment key={v.id}>
                        <tr
                          className="hover:bg-sakura-50/40 dark:hover:bg-sumi-800/50 transition-colors group cursor-pointer"
                          onClick={() => setTableExpandedId(tableExpandedId === v.id ? null : v.id)}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="jp-text text-xl font-black text-slate-900 dark:text-white">{v.word}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  speak(v.word);
                                }}
                                className="p-1 text-slate-400 hover:text-sakura-600 text-xs"
                                title="Nghe âm"
                              >
                                🔊
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-bold text-sakura-600 dark:text-sakura-400 text-xs">{v.kana}</p>
                            <p className="text-[11px] font-mono text-slate-400">{v.romaji}</p>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-sumi-800 px-2 py-0.5 rounded">
                              {POS_MAP[v.partOfSpeech] || v.partOfSpeech}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{v.meaning}</td>
                          <td className="py-3 px-4">
                            <Badge variant="fuji">{v.jlptLevel}</Badge>
                          </td>
                          <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              {v.examples.length > 0 && (
                                <button
                                  onClick={() => setTableExpandedId(tableExpandedId === v.id ? null : v.id)}
                                  className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white px-2 py-1 bg-slate-100 dark:bg-sumi-800 rounded-lg"
                                >
                                  {tableExpandedId === v.id ? "▲ Ẩn VD" : "▼ Ví dụ"}
                                </button>
                              )}
                              <button
                                onClick={() => handleAddToSrs("VOCAB", v.id, v.word)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                                  savedSet.has(v.id)
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                    : "bg-sakura-100 text-sakura-700 hover:bg-sakura-200"
                                }`}
                              >
                                {savedSet.has(v.id) ? "✓ SRS" : "+ SRS"}
                              </button>
                            </div>
                          </td>
                        </tr>
                        {tableExpandedId === v.id && v.examples.length > 0 && (
                          <tr key={`${v.id}-ex`} className="bg-slate-50/80 dark:bg-sumi-950/80">
                            <td colSpan={6} className="p-3 pl-8">
                              <div className="text-xs space-y-1">
                                <p className="jp-text font-bold text-slate-900 dark:text-white text-sm">
                                  {v.examples[0].japanese}{" "}
                                  <button onClick={() => speak(v.examples[0].japanese)} className="ml-1 text-slate-400">
                                    🔊
                                  </button>
                                </p>
                                {v.examples[0].romaji && (
                                  <p className="text-[11px] font-semibold text-sakura-600 dark:text-sakura-400">
                                    {v.examples[0].romaji}
                                  </p>
                                )}
                                <p className="text-slate-600 dark:text-slate-300 font-medium">👉 {v.examples[0].meaning}</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))
                  : currentKanjiSlice.map((k) => (
                      <tr key={k.id} className="hover:bg-slate-50 dark:hover:bg-sumi-800/50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="jp-text text-3xl font-black text-rose-600 dark:text-rose-400">{k.character}</span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-xs font-bold text-amber-700 dark:text-amber-300">
                            On: {k.readings.filter((r) => r.type === "ONYOMI").map((r) => r.reading).join(", ")}
                          </p>
                          <p className="text-xs font-bold text-fuji-600 dark:text-indigo-300">
                            Kun: {k.readings.filter((r) => r.type === "KUNYOMI").map((r) => r.reading).join(", ")}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500">{k.strokeCount} nét</td>
                        <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{k.meaning}</td>
                        <td className="py-3 px-4">
                          <Badge variant="fuji">{k.jlptLevel}</Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleAddToSrs("KANJI", k.id, k.character)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                              savedSet.has(k.id)
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-sakura-100 text-sakura-700 hover:bg-sakura-200"
                            }`}
                          >
                            {savedSet.has(k.id) ? "✓ SRS" : "+ SRS"}
                          </button>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-3.5 border-t border-slate-100 dark:border-slate-800 text-xs font-bold">
              <span>
                Trang {currentPage} / {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                  ◀ Trước
                </Button>
                <Button size="sm" variant="ghost" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                  Sau ▶
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 3: FLASHCARD SLIDESHOW MODE (THẺ GHI NHỚ 3D) */}
      {viewMode === "FLASHCARD" && (
        <div className="max-w-xl mx-auto space-y-4">
          {filteredVocab.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-slate-500 font-bold">Không tìm thấy từ vựng nào phù hợp với bộ lọc.</p>
            </Card>
          ) : (
            (() => {
              const currentItem = filteredVocab[flashcardIndex % filteredVocab.length];
              if (!currentItem) return null;

              return (
                <div className="space-y-4">
                  {/* Progress Header */}
                  <div className="flex items-center justify-between text-xs font-black text-slate-500 px-1">
                    <span>
                      Thẻ {flashcardIndex + 1} / {filteredVocab.length}
                    </span>
                    <div className="w-36 h-2 bg-slate-200 dark:bg-sumi-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sakura-500 transition-all duration-300"
                        style={{ width: `${((flashcardIndex + 1) / filteredVocab.length) * 100}%` }}
                      ></div>
                    </div>
                    <Badge variant="fuji">{currentItem.jlptLevel}</Badge>
                  </div>

                  {/* 3D Flip Flashcard Box */}
                  <div
                    onClick={() => {
                      playClick();
                      setIsFlipped(!isFlipped);
                    }}
                    className="cursor-pointer group relative min-h-[300px] sm:min-h-[340px] w-full rounded-3xl border-2 border-sakura-200 dark:border-sakura-900 bg-gradient-to-br from-white via-sakura-50/20 to-rose-50/40 dark:from-sumi-900 dark:via-sumi-900 dark:to-sumi-950 p-8 shadow-xl flex flex-col justify-between transition-all hover:scale-[1.01]"
                  >
                    {!isFlipped ? (
                      /* FRONT SIDE */
                      <div className="flex flex-col items-center justify-center my-auto text-center space-y-4">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          MẶT TRƯỚC - CLICK ĐỂ LẬT THẺ 🔄
                        </span>
                        <h2 className="jp-text text-5xl sm:text-6xl font-black text-slate-900 dark:text-white drop-shadow-sm">
                          {currentItem.word}
                        </h2>
                        <p className="text-lg font-bold text-sakura-600 dark:text-sakura-400">{currentItem.kana}</p>
                        <p className="text-xs font-mono text-slate-400">{currentItem.romaji}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            speak(currentItem.word);
                          }}
                          className="mt-2 px-4 py-2 rounded-2xl bg-white dark:bg-sumi-800 shadow-sm border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-sakura-50"
                        >
                          🔊 Nghe phát âm
                        </button>
                      </div>
                    ) : (
                      /* BACK SIDE */
                      <div className="flex flex-col items-center justify-center my-auto text-center space-y-4 animate-fade-in">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                          MẶT SAU - NGHĨA & VÍ DỤ 💡
                        </span>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white">{currentItem.meaning}</h3>
                        <span className="inline-block text-xs font-bold text-slate-500 bg-slate-100 dark:bg-sumi-800 px-3 py-1 rounded-full">
                          {POS_MAP[currentItem.partOfSpeech] || currentItem.partOfSpeech}
                        </span>

                        {currentItem.examples.length > 0 && (
                          <div className="mt-4 bg-white/80 dark:bg-sumi-950/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs max-w-md w-full space-y-1">
                            <p className="jp-text font-bold text-slate-800 dark:text-slate-200 text-base">
                              {currentItem.examples[0].japanese}
                            </p>
                            {currentItem.examples[0].romaji && (
                              <p className="text-xs font-semibold text-sakura-600">{currentItem.examples[0].romaji}</p>
                            )}
                            <p className="text-slate-600 dark:text-slate-400 font-medium">👉 {currentItem.examples[0].meaning}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 pt-4 border-t border-slate-200/60 dark:border-slate-800">
                      <span>{isFlipped ? "🔄 Click để xem lại từ" : "💡 Click để xem nghĩa"}</span>
                      <span>Chủ đề: {currentItem.tags?.split(",")[0] || "Chung"}</span>
                    </div>
                  </div>

                  {/* Controls Row */}
                  <div className="flex items-center justify-between gap-3">
                    <Button
                      variant="outline"
                      size="md"
                      disabled={flashcardIndex === 0}
                      onClick={() => {
                        playClick();
                        setIsFlipped(false);
                        setFlashcardIndex((i) => Math.max(0, i - 1));
                      }}
                    >
                      ◀ Thẻ trước
                    </Button>

                    <Button
                      variant="sakura"
                      size="md"
                      onClick={() => {
                        handleAddToSrs("VOCAB", currentItem.id, currentItem.word);
                      }}
                    >
                      {savedSet.has(currentItem.id) ? "✓ Đã lưu SRS" : "🔖 Lưu vào SRS"}
                    </Button>

                    <Button
                      variant="primary"
                      size="md"
                      disabled={flashcardIndex === filteredVocab.length - 1}
                      onClick={() => {
                        playClick();
                        setIsFlipped(false);
                        setFlashcardIndex((i) => Math.min(filteredVocab.length - 1, i + 1));
                      }}
                    >
                      Thẻ tiếp ▶
                    </Button>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* VIEW MODE 4: TOPIC GROUPING VIEW (NHÓM THEO CHỦ ĐỀ CÓ HÌNH DÁNG) */}
      {viewMode === "TOPIC" && tab === "VOCAB" && (
        <div className="space-y-6">
          {Object.entries(topicGroups).map(([topicTitle, items]) => {
            if (items.length === 0) return null;
            const isExpanded = expandedTopics.has(topicTitle);
            const visibleItems = isExpanded ? items : items.slice(0, 6);

            return (
              <div
                key={topicTitle}
                className="bg-white/90 dark:bg-sumi-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 flex-wrap gap-2">
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    {topicTitle}
                    <span className="text-xs font-bold text-sakura-600 bg-sakura-50 dark:bg-sakura-950/60 px-2.5 py-0.5 rounded-full border border-sakura-200 dark:border-sakura-900">
                      {items.length} từ
                    </span>
                  </h3>

                  {items.length > 6 && (
                    <button
                      onClick={() => toggleTopicExpand(topicTitle)}
                      className="text-xs font-bold text-sakura-600 hover:text-sakura-700 bg-sakura-50 hover:bg-sakura-100 dark:bg-sakura-950/60 dark:text-sakura-300 px-3 py-1.5 rounded-xl border border-sakura-200 dark:border-sakura-900 transition flex items-center gap-1 cursor-pointer"
                    >
                      {isExpanded ? "▲ Thu gọn" : `▼ Mở rộng tất cả ${items.length} từ`}
                    </button>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleItems.map((v) => (
                    <div
                      key={v.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-sumi-950 border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-2 hover:border-sakura-300 transition"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="jp-text text-lg font-black text-slate-900 dark:text-white">{v.word}</span>
                          <button onClick={() => speak(v.word)} className="text-slate-400 hover:text-slate-700 text-xs">
                            🔊
                          </button>
                        </div>
                        <p className="text-[11px] font-bold text-sakura-600 dark:text-sakura-400">{v.kana}</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">{v.meaning}</p>
                      </div>
                      <button
                        onClick={() => handleAddToSrs("VOCAB", v.id, v.word)}
                        className={`px-2 py-1 text-[11px] font-bold rounded-lg transition ${
                          savedSet.has(v.id)
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-sakura-100 text-sakura-700 hover:bg-sakura-200"
                        }`}
                      >
                        {savedSet.has(v.id) ? "✓" : "+ SRS"}
                      </button>
                    </div>
                  ))}
                </div>

                {items.length > 6 && (
                  <div className="pt-2 text-center">
                    <button
                      onClick={() => toggleTopicExpand(topicTitle)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-slate-100 dark:bg-sumi-800 hover:bg-sakura-100 dark:hover:bg-sumi-700 text-xs font-extrabold text-slate-700 dark:text-slate-200 transition cursor-pointer"
                    >
                      {isExpanded
                        ? "▲ Thu gọn danh sách"
                        : `▼ Xem tất cả ${items.length - 6} từ vựng khác trong chủ đề này`}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
