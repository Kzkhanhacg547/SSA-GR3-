"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STEPS = [
  { id: "level", title: "Trình độ của bạn？", subtitle: "Chúng tôi sẽ tùy chỉnh lộ trình học phù hợp" },
  { id: "goal", title: "Mục tiêu học tập？", subtitle: "Chúng tôi sẽ ưu tiên nội dung phù hợp nhất với bạn" },
  { id: "time", title: "Thời gian học mỗi ngày？", subtitle: "Tính kiên trì quan trọng hơn thời lượng！" },
];

const LEVEL_OPTIONS = [
  { value: "N5", label: "Mới Bắt Đầu", desc: "Tôi chưa biết gì về tiếng Nhật", icon: "🌱", detail: "Hiragana → Katakana → Cơ bản N5" },
  { value: "N4", label: "Sơ Cấp (N5 xong rồi)", desc: "Tôi đã biết Kana và vài trăm từ", icon: "🌿", detail: "Từ vựng mở rộng + Ngữ pháp N4" },
  { value: "N3", label: "Trung Cấp (N4 xong rồi)", desc: "Tôi đọc được Kana, biết một ít Kanji", icon: "🌳", detail: "Hội thoại + Kanji N3 + Phong cách" },
];

const GOAL_OPTIONS = [
  { value: "TRAVEL", label: "Du Lịch Nhật Bản", icon: "✈️", desc: "Giao tiếp cơ bản tại sân bay, khách sạn, nhà hàng, mua sắm" },
  { value: "JLPT", label: "Thi JLPT", icon: "📜", desc: "Luyện tập bài thi có hệ thống, đạt chứng chỉ quốc tế" },
  { value: "CONVERSATION", label: "Giao Tiếp Hàng Ngày", icon: "💬", desc: "Nói chuyện tự nhiên với người Nhật về mọi chủ đề" },
  { value: "CULTURE", label: "Văn Hóa & Anime", icon: "🎎", desc: "Hiểu anime, manga, J-pop, văn hóa Nhật không cần sub" },
];

const TIME_OPTIONS = [
  { value: 10, label: "10 phút", desc: "Học nhanh trong lúc uống cà phê", emoji: "☕" },
  { value: 15, label: "15 phút", emoji: "🎯", desc: "Vừa phải, dễ duy trì mỗi ngày", recommended: true },
  { value: 30, label: "30 phút", emoji: "📚", desc: "Tiến bộ nhanh, phù hợp khi có thời gian" },
  { value: 60, label: "1 giờ", emoji: "🔥", desc: "Cường độ cao cho người có mục tiêu rõ ràng" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selections, setSelections] = useState({
    learningLevel: "N5",
    learningGoal: "TRAVEL",
    dailyGoalMinutes: 15,
  });

  const currentStep = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleNext = async () => {
    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }

    setLoading(true);
    await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...selections,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Ho_Chi_Minh",
        onboardingCompleted: true,
      }),
    });
    router.push("/app");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-sakura-50/30 to-fuji-50/20 dark:from-slate-950 dark:via-sumi-950 dark:to-slate-950">
      {/* Background decorative */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-sakura-300/20 dark:bg-sakura-900/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-fuji-300/20 dark:bg-fuji-900/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-sakura-500 via-rose-500 to-amber-500 shadow-xl shadow-sakura-500/40 mb-3">
            <span className="text-xl font-black text-white">日</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Bước {step + 1} / {STEPS.length} — Cá nhân hóa hành trình học tập
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-1.5 mb-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                i <= step ? "bg-gradient-to-r from-sakura-500 to-rose-500" : "bg-slate-200 dark:bg-slate-800"
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="bg-white/90 dark:bg-sumi-950/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl p-8 space-y-6">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">{currentStep.title}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{currentStep.subtitle}</p>
          </div>

          {/* Step 1: Level */}
          {step === 0 && (
            <div className="space-y-3">
              {LEVEL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelections((s) => ({ ...s, learningLevel: opt.value }))}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                    selections.learningLevel === opt.value
                      ? "border-sakura-400 bg-sakura-50 dark:bg-sakura-950/30 dark:border-sakura-700 shadow-md shadow-sakura-500/10"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-sumi-900"
                  }`}
                >
                  <span className="text-3xl">{opt.icon}</span>
                  <div>
                    <p className={`font-black text-sm ${selections.learningLevel === opt.value ? "text-sakura-600 dark:text-sakura-400" : "text-slate-800 dark:text-white"}`}>
                      {opt.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                    <p className={`text-[10px] font-bold mt-0.5 ${selections.learningLevel === opt.value ? "text-sakura-500" : "text-slate-400"}`}>
                      {opt.detail}
                    </p>
                  </div>
                  {selections.learningLevel === opt.value && (
                    <span className="ml-auto text-sakura-500 text-xl shrink-0">✅</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Goal */}
          {step === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GOAL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelections((s) => ({ ...s, learningGoal: opt.value }))}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    selections.learningGoal === opt.value
                      ? "border-fuji-400 bg-fuji-50 dark:bg-fuji-950/30 dark:border-fuji-700 shadow-md shadow-fuji-500/10"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                  }`}
                >
                  <div className="text-3xl mb-2">{opt.icon}</div>
                  <p className={`font-black text-sm ${selections.learningGoal === opt.value ? "text-fuji-600 dark:text-fuji-400" : "text-slate-800 dark:text-white"}`}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 leading-snug">{opt.desc}</p>
                </button>
              ))}
            </div>
          )}

          {/* Step 3: Daily Time */}
          {step === 2 && (
            <div className="space-y-3">
              {TIME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelections((s) => ({ ...s, dailyGoalMinutes: opt.value }))}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                    selections.dailyGoalMinutes === opt.value
                      ? "border-amber-400 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 shadow-md shadow-amber-500/10"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                  }`}
                >
                  <span className="text-3xl">{opt.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`font-black text-sm ${selections.dailyGoalMinutes === opt.value ? "text-amber-700 dark:text-amber-300" : "text-slate-800 dark:text-white"}`}>
                        {opt.label}
                      </p>
                      {opt.recommended && (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-300">
                          Khuyên dùng
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                  </div>
                  {selections.dailyGoalMinutes === opt.value && (
                    <span className="text-amber-500 text-xl shrink-0">✅</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-sm font-black text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-sumi-900 transition"
              >
                ← Quay lại
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={loading}
              className={`py-3.5 rounded-2xl bg-gradient-to-r from-sakura-500 via-rose-500 to-sakura-600 text-white font-black text-sm tracking-wide shadow-lg shadow-sakura-500/30 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 ${step > 0 ? "flex-1" : "w-full"}`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang thiết lập...
                </span>
              ) : isLast ? (
                "🚀 Bắt Đầu Học！"
              ) : (
                "Tiếp theo →"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
