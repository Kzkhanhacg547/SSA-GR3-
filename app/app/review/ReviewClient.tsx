"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Badge, EmptyState } from "@/components/ui";
import { useSoundAndTheme } from "@/components/SoundAndThemeContext";
import Link from "next/link";
import { type EnrichedReviewItem } from "@/lib/review/resolveReviewItem";

export function ReviewClient({ initial }: { initial: EnrichedReviewItem[] }) {
  const router = useRouter();
  const { playClick, playCorrect, playFanfare, showToast } = useSoundAndTheme();

  const [items, setItems] = useState<EnrichedReviewItem[]>(initial);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentItem = items[currentIndex];

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

  const getMemoryStage = (reps: number, interval: number) => {
    if (reps >= 6 || interval >= 21) {
      return { label: "💎 Trí nhớ vĩnh viễn", color: "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300" };
    }
    if (reps >= 4 || interval >= 7) {
      return { label: "🌳 Nhớ sâu sắc", color: "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300" };
    }
    if (reps >= 2 || interval >= 3) {
      return { label: "🌿 Đang quen dần", color: "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300" };
    }
    return { label: "🌱 Mới tiếp thu", color: "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-300" };
  };

  // Helper for adaptive text size based on length
  const getAdaptiveFontClass = (text: string) => {
    const len = text ? text.trim().length : 0;
    if (len <= 2) return "text-5xl sm:text-6xl font-black";
    if (len <= 8) return "text-3xl sm:text-4xl font-black";
    if (len <= 20) return "text-2xl sm:text-3xl font-bold";
    if (len <= 45) return "text-lg sm:text-xl font-bold leading-snug";
    return "text-base sm:text-lg font-semibold leading-relaxed";
  };

  const handleGrade = useCallback(async (grade: "AGAIN" | "HARD" | "GOOD" | "EASY") => {
    if (!currentItem || submitting) return;
    setSubmitting(true);
    playClick();

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewItemId: currentItem.id, grade }),
      });

      if (!res.ok) {
        showToast({ title: "Lỗi lưu đánh giá, vui lòng thử lại.", type: "error" });
        setSubmitting(false);
        return;
      }

      playCorrect();
      setIsFlipped(false);

      if (grade === "AGAIN") {
        // Re-queue at end of session for immediate re-review
        const requeued = [...items];
        const [card] = requeued.splice(currentIndex, 1);
        requeued.push(card);
        setItems(requeued);
        setCurrentIndex(currentIndex >= requeued.length ? 0 : currentIndex);
      } else {
        const nextItems = items.filter((_, idx) => idx !== currentIndex);
        setItems(nextItems);

        if (nextItems.length === 0) {
          playFanfare();
          showToast({
            title: "🏆 Phiên ôn tập hoàn tất! +20 XP thưởng！",
            description: "Chúc mừng bạn đã bảo vệ kiến thức khỏi đường cong quên lãng!",
            type: "achievement",
          });
          await fetch("/api/activity", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "REVIEW_COMPLETE", xp: 20 }),
          }).catch(() => {});
          router.refresh();
        } else {
          setCurrentIndex((prev) => (prev >= nextItems.length ? 0 : prev));
        }
      }
    } catch {
      showToast({ title: "Có lỗi xảy ra khi kết nối máy chủ.", type: "error" });
    }
    setSubmitting(false);
  }, [currentItem, submitting, items, currentIndex, playClick, playCorrect, playFanfare, showToast, router]);

  // Keyboard shortcuts (Space to flip, 1-4 to rate)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        setIsFlipped((f) => !f);
      }
      if (isFlipped && !submitting) {
        if (e.key === "1") handleGrade("AGAIN");
        if (e.key === "2") handleGrade("HARD");
        if (e.key === "3") handleGrade("GOOD");
        if (e.key === "4") handleGrade("EASY");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isFlipped, submitting, handleGrade]);

  if (!items.length) {
    return (
      <div className="space-y-6 max-w-xl mx-auto py-4">
        <EmptyState
          icon="🧠✨"
          title="Tất cả kiến thức đã được ghi nhớ vững chắc!"
          body="Hiện tại không có thẻ nào đến hạn quên. Hệ thống SRS sẽ tự động tính toán chu kỳ và nhắc nhở bạn đúng thời điểm vàng."
          action={
            <div className="flex gap-3 justify-center">
              <Link href="/app/practice">
                <Button variant="sakura" size="md" className="font-bold shadow-md">
                  Tiếp tục bài học N5 📖
                </Button>
              </Link>
              <Link href="/app">
                <Button variant="secondary" size="md" className="font-bold">
                  Về Dashboard ⛩️
                </Button>
              </Link>
            </div>
          }
        />

        {/* SRS Explanatory Guide Card */}
        <Card className="p-4 border-dashed border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-sumi-900/50 space-y-2">
          <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <span>💡</span> Cơ chế Spaced Repetition (SRS)
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Hệ thống tự động điều chỉnh giãn cách ôn tập (1 ngày ➔ 3 ngày ➔ 7 ngày ➔ 14 ngày ➔ 30 ngày) dựa theo mức độ ghi nhớ bạn đánh giá, giúp bạn ghi nhớ kiến thức trọn đời mà không tốn công học dồn.
          </p>
        </Card>
      </div>
    );
  }

  const memoryStage = getMemoryStage(currentItem.repetitions, currentItem.interval);
  const isJapaneseText = currentItem.contentType === "KANA" || currentItem.contentType === "VOCAB" || currentItem.contentType === "KANJI";

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Top Header: Progress and SRS Help Toggle */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-slate-700 dark:text-slate-200">
            Thẻ {currentIndex + 1} / {items.length}
          </span>
          <span className="text-xs text-slate-400 font-medium">({items.length} thẻ trong hàng đợi)</span>
        </div>

        <button
          type="button"
          onClick={() => setShowExplanation(!showExplanation)}
          className="text-xs font-bold text-sakura-600 dark:text-sakura-400 hover:underline flex items-center gap-1"
        >
          <span>🧠</span>
          <span>{showExplanation ? "Ẩn giải thích ✕" : "SRS là gì?"}</span>
        </button>
      </div>

      {/* Progress Dots */}
      <div className="flex gap-1.5 w-full">
        {items.slice(0, 15).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-200 ${
              i === currentIndex
                ? "bg-sakura-500 scale-y-125"
                : i < currentIndex
                ? "bg-emerald-400 dark:bg-emerald-600"
                : "bg-slate-200 dark:bg-sumi-800"
            }`}
          />
        ))}
      </div>

      {showExplanation && (
        <div className="p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-sumi-900 border border-indigo-200/70 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1 leading-relaxed animate-in fade-in">
          <p>
            • <strong>Nhớ tốt / Rất dễ</strong>: Nhân rộng thời gian giãn cách ôn tiếp theo (từ 1 ngày ➔ 3 ngày ➔ 7 ngày).
          </p>
          <p>
            • <strong>Quên rồi</strong>: Thẻ sẽ đưa về cuối hàng đợi của phiên hôm nay để bạn làm quen lại ngay.
          </p>
        </div>
      )}

      {/* Interactive 3D Flashcard */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="perspective-1000 cursor-pointer select-none group w-full"
      >
        <div
          className={`relative min-h-[300px] sm:min-h-[340px] w-full rounded-3xl transition-transform duration-500 transform-style-3d shadow-lg border-2 ${
            isFlipped
              ? "rotate-y-180 border-sakura-300 dark:border-sakura-700 bg-white dark:bg-sumi-900"
              : "border-slate-200/90 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50/60 to-sakura-50/30 dark:from-sumi-900 dark:via-sumi-950 dark:to-sumi-900 hover:border-sakura-300 dark:hover:border-sakura-800"
          }`}
        >
          {/* FRONT OF CARD */}
          <div className="absolute inset-0 backface-hidden p-5 sm:p-7 flex flex-col justify-between items-center text-center overflow-hidden">
            {/* Header: Badge & Status */}
            <div className="flex items-center justify-between w-full">
              <Badge variant="sakura">{currentItem.subtitle || currentItem.contentType}</Badge>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${memoryStage.color}`}>
                  {memoryStage.label}
                </span>
                {isJapaneseText && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speak(currentItem.title);
                    }}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-sumi-800 transition"
                    title="Phát âm tiếng Nhật"
                    aria-label="Phát âm"
                  >
                    🔊
                  </button>
                )}
              </div>
            </div>

            {/* Main Content Area with Adaptive Typography */}
            <div className="my-auto py-3 px-2 max-w-full flex flex-col items-center justify-center">
              <p
                className={`${getAdaptiveFontClass(currentItem.title)} text-slate-900 dark:text-white tracking-wide break-words max-w-full`}
              >
                {currentItem.title}
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-sumi-800 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                <span>🔄 Bấm vào thẻ hoặc</span>
                <kbd className="px-1.5 py-0.2 rounded bg-white dark:bg-sumi-900 font-mono font-bold border border-slate-200 dark:border-slate-700">Space</kbd>
                <span>để lật đáp án</span>
              </div>
            </div>

            {/* Footer Stats */}
            <div className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <span>Đã củng cố: {currentItem.repetitions} lần</span>
              <span>Chu kỳ hiện tại: {currentItem.interval} ngày</span>
            </div>
          </div>

          {/* BACK OF CARD */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 p-5 sm:p-7 flex flex-col justify-between items-center text-center overflow-hidden">
            {/* Header: Answer Badge & Audio */}
            <div className="flex items-center justify-between w-full">
              <Badge variant="matcha">Đáp Án Chi Tiết</Badge>
              {isJapaneseText && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(currentItem.title);
                  }}
                  className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-sumi-800 transition"
                  title="Phát âm tiếng Nhật"
                  aria-label="Phát âm"
                >
                  🔊
                </button>
              )}
            </div>

            {/* Main Answer Area */}
            <div className="my-auto py-3 px-2 max-w-full flex flex-col items-center justify-center space-y-2">
              <p className={`${getAdaptiveFontClass(currentItem.title)} text-slate-900 dark:text-white break-words max-w-full`}>
                {currentItem.title}
              </p>

              <div className="flex flex-col items-center justify-center gap-1.5">
                {currentItem.reading && (
                  <span className="text-lg sm:text-2xl font-black text-sakura-600 dark:text-sakura-400">
                    {currentItem.reading}
                  </span>
                )}
                {currentItem.extra && (
                  <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-md bg-slate-50 dark:bg-sumi-800/80 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700/60">
                    {currentItem.extra}
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Hint */}
            <div className="w-full text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              Đánh giá mức độ nhớ của bạn bên dưới 👇
            </div>
          </div>
        </div>
      </div>

      {/* Explicit Flip Button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setIsFlipped(!isFlipped)}
          className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-sakura-600 dark:hover:text-sakura-400 px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-sumi-800 dark:hover:bg-sumi-700 transition flex items-center gap-1.5 shadow-sm"
        >
          <span>🔄</span>
          <span>{isFlipped ? "Lật lại mặt trước" : "Lật xem đáp án"}</span>
        </button>
      </div>

      {/* SRS Rating Action Buttons */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
          <span>ĐÁNH GIÁ ĐỘ GHI NHỚ (SM-2)</span>
          <span className="hidden sm:block text-slate-400 font-normal">
            Phím tắt: <kbd className="px-1 rounded bg-slate-100 dark:bg-sumi-800 font-mono font-bold">1</kbd>{" "}
            <kbd className="px-1 rounded bg-slate-100 dark:bg-sumi-800 font-mono font-bold">2</kbd>{" "}
            <kbd className="px-1 rounded bg-slate-100 dark:bg-sumi-800 font-mono font-bold">3</kbd>{" "}
            <kbd className="px-1 rounded bg-slate-100 dark:bg-sumi-800 font-mono font-bold">4</kbd>
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          <Button
            variant="danger"
            size="sm"
            disabled={submitting}
            onClick={() => handleGrade("AGAIN")}
            className="flex-col py-2.5 sm:py-3 h-auto shadow-sm"
          >
            <span className="text-base sm:text-lg leading-none">🔴</span>
            <span className="text-xs font-black mt-1">Quên rồi</span>
            <span className="text-[10px] opacity-80 mt-0.5">[1] &lt; 10p</span>
          </Button>

          <Button
            variant="gold"
            size="sm"
            disabled={submitting}
            onClick={() => handleGrade("HARD")}
            className="flex-col py-2.5 sm:py-3 h-auto text-amber-950 shadow-sm"
          >
            <span className="text-base sm:text-lg leading-none">🟠</span>
            <span className="text-xs font-black mt-1">Hơi khó</span>
            <span className="text-[10px] opacity-80 mt-0.5">[2] 1 ngày</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            disabled={submitting}
            onClick={() => handleGrade("GOOD")}
            className="flex-col py-2.5 sm:py-3 h-auto border border-fuji-300 dark:border-fuji-800 shadow-sm"
          >
            <span className="text-base sm:text-lg leading-none">🔵</span>
            <span className="text-xs font-black mt-1">Nhớ tốt</span>
            <span className="text-[10px] opacity-80 mt-0.5">[3] 3 ngày</span>
          </Button>

          <Button
            variant="sakura"
            size="sm"
            disabled={submitting}
            onClick={() => handleGrade("EASY")}
            className="flex-col py-2.5 sm:py-3 h-auto shadow-sm"
          >
            <span className="text-base sm:text-lg leading-none">🟢</span>
            <span className="text-xs font-black mt-1">Rất dễ</span>
            <span className="text-[10px] opacity-80 mt-0.5">[4] 7 ngày</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
