"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Badge } from "@/components/ui";
import { useSoundAndTheme } from "@/components/SoundAndThemeContext";
import Link from "next/link";

interface Option {
  id: string;
  label: string;
  text: string;
  isCorrect?: boolean;
}

interface Exercise {
  id: string;
  type: string;
  question: string;
  prompt?: string | null;
  correctAnswer: string;
  options: Option[];
  points: number;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  exercises: Exercise[];
}

interface NextLesson {
  id: string;
  slug: string;
  title: string;
  level: string;
  xpReward: number;
}

// Grammatical explanation helper for Japanese questions
function getGrammarExplanation(question: string, correctAnswer: string, prompt?: string | null) {
  if (prompt && prompt.trim().length > 5) {
    return {
      title: "Giải thích ngữ cảnh",
      breakdown: prompt,
      rule: "Ghi nhớ cấu trúc mẫu câu tương ứng trong ngữ cảnh này.",
    };
  }

  // Detect grammatical patterns
  if (correctAnswer.includes("は") && (correctAnswer.includes("です") || correctAnswer.includes("ではありません"))) {
    return {
      title: "Cấu trúc Danh từ & Trợ từ 「は」(wa)",
      breakdown: "「は」 đóng vai trò trợ từ chỉ chủ đề của câu. 「です」 là đuôi câu khẳng định lịch sự.",
      rule: "A は B です (A là B) · A は B ではありません (A không phải là B)",
    };
  }

  if (correctAnswer.includes("を") && correctAnswer.includes("ます")) {
    return {
      title: "Trợ từ Tân ngữ 「を」(o)",
      breakdown: "「を」 kết nối giữa đối tượng tác động (tân ngữ) và hành động (động từ).",
      rule: "Danh từ + を + Động từ (Ví dụ: 水を飲みます - Uống nước)",
    };
  }

  if (correctAnswer.includes("に") || correctAnswer.includes("へ")) {
    return {
      title: "Trợ từ Điểm đến & Thời gian 「に / へ」",
      breakdown: "「に / へ」 chỉ hướng chuyển động tới địa điểm, hoặc thời điểm cụ thể diễn ra hành động.",
      rule: "Địa điểm + に/へ + 行きます (Đi tới đâu) · Thời gian + に + Hành động",
    };
  }

  if (correctAnswer.includes("これ") || correctAnswer.includes("それ") || correctAnswer.includes("あれ")) {
    return {
      title: "Đại từ chỉ định Ko-So-A-Do",
      breakdown: "これ (vật ở gần người nói) · それ (vật ở gần người nghe) · あれ (vật ở xa cả hai).",
      rule: "これ / それ / あれ + は + Danh từ + です",
    };
  }

  return {
    title: "Phân tích câu trả lời đúng",
    breakdown: `Đáp án chính xác là "${correctAnswer}". Hãy chú ý sự phù hợp giữa câu hỏi và ngữ cảnh đối thoại.`,
    rule: "Ôn tập lại từ vựng và mẫu câu này để củng cố phản xạ.",
  };
}

export function QuizRunner({
  lesson,
  nextLesson,
}: {
  lesson: Lesson;
  nextLesson: NextLesson | null;
}) {
  const router = useRouter();
  const { playClick, playCorrect, playIncorrect, playFanfare, showToast, speak } = useSoundAndTheme();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [hasChecked, setHasChecked] = useState(false);
  const [answersLog, setAnswersLog] = useState<
    Array<{ exerciseId: string; question: string; answer: string; correctAnswer: string; isCorrect: boolean }>
  >([]);
  const [isFinished, setIsFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [summaryData, setSummaryData] = useState<{ score: number; xpAwarded: number } | null>(null);

  const totalQuestions = lesson.exercises.length;
  const currentExercise = lesson.exercises[currentIndex];

  const displayedOptions = useMemo(() => {
    if (!currentExercise?.options || currentExercise.options.length === 0) return [];
    const list = [...currentExercise.options];
    // Fisher-Yates random shuffle for fair distribution across A, B, C, D
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    const labels = ["A", "B", "C", "D", "E", "F"];
    return list.map((opt, idx) => ({
      ...opt,
      displayLabel: labels[idx] ?? String.fromCharCode(65 + idx),
    }));
  }, [currentExercise?.id, currentIndex]);

  const speakText = (text: string) => {
    speak(text);
  };

  const handleSelectOption = useCallback((text: string) => {
    if (hasChecked) return;
    playClick();
    setSelectedAnswer(text);
  }, [hasChecked, playClick]);

  const handleCheckAnswer = useCallback(() => {
    if (!selectedAnswer || hasChecked || !currentExercise) return;

    const isCorrect =
      selectedAnswer.trim().toLowerCase() === currentExercise.correctAnswer.trim().toLowerCase();

    if (isCorrect) {
      playCorrect();
    } else {
      playIncorrect();
    }

    setHasChecked(true);
    setAnswersLog((prev) => [
      ...prev,
      {
        exerciseId: currentExercise.id,
        question: currentExercise.question,
        answer: selectedAnswer,
        correctAnswer: currentExercise.correctAnswer,
        isCorrect,
      },
    ]);
  }, [selectedAnswer, hasChecked, currentExercise, playCorrect, playIncorrect]);

  const finishLesson = useCallback(async () => {
    setSubmitting(true);
    const correctCount = answersLog.filter((a) => a.isCorrect).length;
    const finalScore = Math.round((correctCount / totalQuestions) * 100);

    try {
      const res = await fetch("/api/lessons/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: lesson.id,
          answers: answersLog.map((a) => ({
            exerciseId: a.exerciseId,
            answer: a.answer,
            timeSpent: 10,
          })),
        }),
      });

      const data = await res.json().catch(() => ({}));
      setIsFinished(true);
      playFanfare();

      const xpEarned = data.xpAwarded ?? (data.isPriorCompleted ? 0 : lesson.xpReward);
      setSummaryData({
        score: finalScore,
        xpAwarded: xpEarned,
      });

      if (data.isPriorCompleted) {
        showToast({
          title: `Luyện tập lại hoàn tất: ${lesson.title}!`,
          description: `Đạt ${finalScore}% điểm · Điểm cao nhất: ${data.bestScore ?? finalScore}%!`,
          type: "info",
        });
      } else {
        showToast({
          title: `Hoàn thành bài học: ${lesson.title}!`,
          description: `Đạt ${finalScore}% điểm · Nhận +${xpEarned} XP!`,
          type: "xp",
        });
      }
      router.refresh();
    } catch {
      setIsFinished(true);
      setSummaryData({ score: finalScore, xpAwarded: 0 });
    }
    setSubmitting(false);
  }, [answersLog, lesson, totalQuestions, playFanfare, showToast, router]);

  const handleNextQuestion = useCallback(async () => {
    playClick();
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer("");
      setHasChecked(false);
    } else {
      await finishLesson();
    }
  }, [currentIndex, totalQuestions, playClick, finishLesson]);

  // Desktop Keyboard Shortcuts (1, 2, 3, 4, Enter)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (!isFinished && currentExercise) {
        if (!hasChecked) {
          if (displayedOptions && displayedOptions.length > 0) {
            const keyNum = parseInt(e.key, 10);
            if (keyNum >= 1 && keyNum <= displayedOptions.length) {
              e.preventDefault();
              handleSelectOption(displayedOptions[keyNum - 1].text);
            }
          }
          if (e.key === "Enter" && selectedAnswer.trim()) {
            e.preventDefault();
            handleCheckAnswer();
          }
        } else {
          if (e.key === "Enter" && !submitting) {
            e.preventDefault();
            handleNextQuestion();
          }
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isFinished, currentExercise, hasChecked, selectedAnswer, submitting, handleSelectOption, handleCheckAnswer, handleNextQuestion]);

  // ==================== UNIFIED LESSON COMPLETE SCREEN ====================
  if (isFinished && summaryData) {
    const correctCount = answersLog.filter((a) => a.isCorrect).length;
    const wrongAnswers = answersLog.filter((a) => !a.isCorrect);

    return (
      <div className="max-w-xl mx-auto py-4 space-y-5 animate-in zoom-in-95 duration-200">
        <Card className="text-center p-6 sm:p-8 border-2 border-sakura-300 dark:border-sakura-800 shadow-xl relative overflow-hidden">
          <div className="text-5xl sm:text-6xl mb-3 animate-bounce">🎉✨</div>
          <Badge variant="sakura" className="mb-2 font-black">
            Hoàn Thành Bài Học
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Xuất Sắc! お疲れ様でした!
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Bạn vừa hoàn thành: <span className="font-bold text-slate-900 dark:text-white">{lesson.title}</span>
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2.5 my-5">
            <div className="bg-slate-50 dark:bg-sumi-800/80 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700">
              <span className="text-[11px] text-slate-500 font-bold uppercase">Đúng</span>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5">
                {correctCount} / {totalQuestions}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-sumi-800/80 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700">
              <span className="text-[11px] text-slate-500 font-bold uppercase">Độ chính xác</span>
              <p className="text-xl sm:text-2xl font-black text-fuji-600 dark:text-indigo-400 mt-0.5">
                {summaryData.score}%
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-sumi-800/80 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700">
              <span className="text-[11px] text-slate-500 font-bold uppercase">Kinh nghiệm</span>
              <p className="text-xl sm:text-2xl font-black text-amber-500 mt-0.5">
                +{summaryData.xpAwarded} XP
              </p>
            </div>
          </div>

          {/* Review items alert if user got any question wrong */}
          {wrongAnswers.length > 0 && (
            <div className="mb-5 p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                  <span>📚</span> {wrongAnswers.length} nội dung cần ôn lại trong SRS
                </span>
                <Link href="/app/review">
                  <Button variant="sakura" size="sm" className="font-bold text-xs py-1 px-3">
                    Ôn ngay 🎴
                  </Button>
                </Link>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Hệ thống đã tự động lưu các câu hỏi chưa chính xác vào hàng đợi Spaced Repetition (SRS) để nhắc bạn ôn tập đúng thời điểm vàng.
              </p>
            </div>
          )}

          {/* Next Lesson Spine Card */}
          {nextLesson ? (
            <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-sakura-50 via-rose-50 to-amber-50 dark:from-sumi-900 dark:to-sumi-950 border-2 border-sakura-200 dark:border-sakura-900 text-left space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-sakura-600 dark:text-sakura-400">
                BÀI HỌC TIẾP THEO · NEXT STEP
              </span>
              <h4 className="font-black text-base text-slate-900 dark:text-white">
                {nextLesson.title}
              </h4>
              <Link href={`/app/practice/${nextLesson.slug}`} className="block pt-1">
                <Button variant="sakura" size="md" className="w-full justify-center font-black shadow-md">
                  Tiếp tục bài học →
                </Button>
              </Link>
            </div>
          ) : (
            <div className="mb-5 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-left space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                🏆 BẠN ĐÃ HOÀN THÀNH TẤT CẢ BÀI HỌC N5!
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Khám phá bản đồ Shinkansen hoặc thử thách hội thoại Survival Mode để áp dụng kiến thức thực tế!
              </p>
              <div className="flex gap-2 pt-1">
                <Link href="/app/journey" className="flex-1">
                  <Button variant="gold" size="sm" className="w-full justify-center font-bold">
                    Khám phá Nhật Bản 🗾
                  </Button>
                </Link>
                <Link href="/app/survival" className="flex-1">
                  <Button variant="secondary" size="sm" className="w-full justify-center font-bold">
                    Hội thoại Survival 🍜
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Navigation link footer */}
          <div className="flex gap-3 justify-center pt-2">
            <Link href="/app/practice" className="flex-1">
              <Button variant="secondary" size="sm" className="w-full justify-center font-semibold">
                ← Danh sách bài học
              </Button>
            </Link>
            <Link href="/app" className="flex-1">
              <Button variant="outline" size="sm" className="w-full justify-center font-semibold">
                Dashboard ⛩️
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // ==================== ACTIVE QUIZ VIEW ====================
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);
  const isCurrentCorrect =
    hasChecked && selectedAnswer.trim().toLowerCase() === currentExercise.correctAnswer.trim().toLowerCase();
  const explanation = hasChecked ? getGrammarExplanation(currentExercise.question, currentExercise.correctAnswer, currentExercise.prompt) : null;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Quiz Header with Progress Bar & Keyboard Hint */}
      <div className="flex items-center justify-between gap-4">
        <Link href="/app/practice" className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition">
          ✕ Rời bài học
        </Link>
        <div className="flex-1 max-w-xs">
          <div className="flex justify-between text-xs font-bold mb-1 text-slate-500">
            <span>Câu {currentIndex + 1} / {totalQuestions}</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-sumi-800 overflow-hidden">
            <div
              className="h-full bg-sakura-500 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        <Badge variant="amber">+{currentExercise.points} XP</Badge>
      </div>

      {/* Question Card */}
      <Card className="p-6 sm:p-8 relative space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
            {currentExercise.question}
          </h3>
          <button
            onClick={() => speakText(currentExercise.question)}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-sumi-800 text-slate-700 dark:text-slate-300 shrink-0 transition"
            title="Nghe phát âm câu hỏi"
            aria-label="Phát âm câu hỏi"
          >
            🔊
          </button>
        </div>

        {/* Options grid */}
        {displayedOptions.length > 0 ? (
          <div className="grid gap-2.5 pt-2">
            {displayedOptions.map((opt: Option & { displayLabel?: string }, idx: number) => {
              const isSelected = selectedAnswer === opt.text;
              let optionStyle =
                "border-slate-200 dark:border-slate-800 bg-white dark:bg-sumi-900 hover:border-slate-300 dark:hover:border-slate-700";

              if (isSelected && !hasChecked) {
                optionStyle =
                  "border-sakura-500 bg-sakura-50/60 dark:bg-sakura-950/40 text-sakura-700 dark:text-sakura-300 shadow-sm ring-1 ring-sakura-400";
              }

              if (hasChecked) {
                if (opt.text.trim().toLowerCase() === currentExercise.correctAnswer.trim().toLowerCase()) {
                  optionStyle =
                    "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 font-bold ring-1 ring-emerald-500";
                } else if (isSelected && !isCurrentCorrect) {
                  optionStyle =
                    "border-red-500 bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-200 ring-1 ring-red-500";
                } else {
                  optionStyle = "opacity-45 border-slate-200 dark:border-slate-800";
                }
              }

              return (
                <button
                  key={opt.id || idx}
                  disabled={hasChecked}
                  onClick={() => handleSelectOption(opt.text)}
                  className={`flex items-center gap-3 w-full p-4 rounded-2xl border-2 text-left transition-all relative ${optionStyle}`}
                >
                  <span className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-sumi-800 flex items-center justify-center text-xs font-black text-slate-700 dark:text-slate-300 shrink-0">
                    {opt.displayLabel}
                  </span>
                  <span className="text-base font-bold flex-1">{opt.text}</span>
                  {hasChecked && opt.text.trim().toLowerCase() === currentExercise.correctAnswer.trim().toLowerCase() && (
                    <span className="text-emerald-600 font-bold text-lg">✓</span>
                  )}
                  {hasChecked && isSelected && !isCurrentCorrect && (
                    <span className="text-red-600 font-bold text-lg">✕</span>
                  )}
                  {/* Keyboard shortcut hint */}
                  <span className="hidden sm:inline-block text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-sumi-800 px-1.5 py-0.5 rounded">
                    Phím {idx + 1}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="pt-2">
            <input
              disabled={hasChecked}
              value={selectedAnswer}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              placeholder="Nhập câu trả lời của bạn..."
              className="w-full p-4 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-sumi-900 text-lg font-bold outline-none focus:border-sakura-500"
            />
          </div>
        )}
      </Card>

      {/* Detailed Feedback & Grammar Explanation Banner */}
      {hasChecked && (
        <div
          className={`p-5 rounded-2xl border space-y-3 animate-in fade-in ${
            isCurrentCorrect
              ? "bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-200"
              : "bg-rose-50 border-rose-300 text-rose-900 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{isCurrentCorrect ? "🎉" : "💡"}</span>
            <div>
              <p className="font-black text-sm">
                {isCurrentCorrect ? "Chính xác! Làm tốt lắm!" : "Chưa chính xác!"}
              </p>
              {!isCurrentCorrect && (
                <p className="text-xs opacity-95 mt-0.5">
                  Đáp án đúng: <span className="font-black underline">{currentExercise.correctAnswer}</span>
                </p>
              )}
            </div>
          </div>

          {/* Grammar analysis card */}
          {explanation && (
            <div className="p-3 rounded-xl bg-white/80 dark:bg-sumi-900/80 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1 text-slate-700 dark:text-slate-300">
              <p className="font-extrabold text-sakura-600 dark:text-sakura-400 flex items-center gap-1">
                <span>📖</span> {explanation.title}
              </p>
              <p className="leading-relaxed">{explanation.breakdown}</p>
              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-0.5">
                💡 {explanation.rule}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Bottom Action Footer with Keyboard Hint */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <span className="hidden sm:inline-block text-xs font-medium text-slate-400">
          ⌨️ Nhấn phím <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-sumi-800 font-mono font-bold">1</kbd>{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-sumi-800 font-mono font-bold">2</kbd>{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-sumi-800 font-mono font-bold">3</kbd>{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-sumi-800 font-mono font-bold">4</kbd> để chọn ·{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-sumi-800 font-mono font-bold">Enter ↵</kbd> để tiếp tục
        </span>

        {!hasChecked ? (
          <Button
            variant="sakura"
            size="lg"
            disabled={!selectedAnswer.trim()}
            onClick={handleCheckAnswer}
            className="w-full sm:w-auto min-w-[170px] font-black"
          >
            Kiểm tra đáp án ✨ [Enter]
          </Button>
        ) : (
          <Button
            variant={isCurrentCorrect ? "sakura" : "primary"}
            size="lg"
            loading={submitting}
            onClick={handleNextQuestion}
            className="w-full sm:w-auto min-w-[170px] font-black"
          >
            {currentIndex < totalQuestions - 1 ? "Câu tiếp theo → [Enter]" : "Hoàn thành bài học 🏁 [Enter]"}
          </Button>
        )}
      </div>
    </div>
  );
}
