"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function PasswordStrength({ password }: { password: string }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  if (!password) return null;

  const levels = [
    { label: "Quá yếu", color: "bg-rose-500", textColor: "text-rose-500" },
    { label: "Yếu", color: "bg-orange-500", textColor: "text-orange-500" },
    { label: "Trung bình", color: "bg-amber-500", textColor: "text-amber-500" },
    { label: "Tốt", color: "bg-lime-500", textColor: "text-lime-500" },
    { label: "Mạnh！🔒", color: "bg-emerald-500", textColor: "text-emerald-500" },
  ];
  const level = levels[Math.min(score, 4)];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? level.color : "bg-slate-200 dark:bg-slate-700"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-bold ${level.textColor}`}>{level.label}</p>
    </div>
  );
}

const LEVEL_OPTIONS = [
  { value: "N5", label: "N5 - Mới bắt đầu", desc: "Hiragana, Katakana, 800 từ cơ bản", icon: "🌱" },
  { value: "N4", label: "N4 - Sơ cấp", desc: "Đã biết N5, muốn nâng cao", icon: "🌿" },
  { value: "N3", label: "N3 - Trung cấp", desc: "Có nền tảng, muốn thành thạo", icon: "🌳" },
];

const GOAL_OPTIONS = [
  { value: "TRAVEL", label: "Du Lịch Nhật", icon: "✈️" },
  { value: "JLPT", label: "Thi JLPT", icon: "📜" },
  { value: "CONVERSATION", label: "Giao Tiếp Hàng Ngày", icon: "💬" },
  { value: "CULTURE", label: "Văn Hóa & Anime", icon: "🎎" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState("N5");
  const [selectedGoal, setSelectedGoal] = useState("TRAVEL");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const data = new FormData(e.currentTarget);
    const payload = {
      displayName: String(data.get("displayName") || ""),
      email: String(data.get("email") || ""),
      password: String(data.get("password") || ""),
      learningLevel: selectedLevel,
      learningGoal: selectedGoal,
      dailyGoalMinutes: Number(data.get("dailyGoalMinutes") || 15),
    };
    if (payload.password !== String(data.get("confirm") || "")) {
      setError("Mật khẩu xác nhận không khớp!");
      setLoading(false);
      return;
    }
    if (payload.password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự！");
      setLoading(false);
      return;
    }
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error || "Đăng ký thất bại. Vui lòng thử lại！");
      setLoading(false);
      return;
    }
    router.push("/login?registered=1");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-sakura-50/30 to-fuji-50/20 dark:from-slate-950 dark:via-sumi-950 dark:to-slate-950">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-sakura-300/20 dark:bg-sakura-900/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-fuji-300/20 dark:bg-fuji-900/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-sakura-500 via-rose-500 to-amber-500 shadow-xl shadow-sakura-500/40 mb-3">
            <span className="text-xl font-black text-white">日</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Tạo Tài Khoản</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Bắt đầu hành trình tiếng Nhật của bạn hôm nay！🌸
          </p>
        </div>

        <div className="bg-white/90 dark:bg-sumi-950/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl p-6 sm:p-8 space-y-5">
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Tên hiển thị
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">😊</span>
                  <input
                    name="displayName"
                    required
                    placeholder="Tên của bạn"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-sumi-900 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sakura-400 dark:focus:border-sakura-700 transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">📧</span>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-sumi-900 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sakura-400 dark:focus:border-sakura-700 transition"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔒</span>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="Tối thiểu 8 ký tự"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-sumi-900 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sakura-400 dark:focus:border-sakura-700 transition"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition text-base">
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔐</span>
                <input
                  name="confirm"
                  type={showConfirm ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="Nhập lại mật khẩu"
                  className="w-full pl-10 pr-12 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-sumi-900 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sakura-400 dark:focus:border-sakura-700 transition"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition text-base">
                  {showConfirm ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Level Selection */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Cấp độ hiện tại
              </label>
              <div className="grid grid-cols-3 gap-2">
                {LEVEL_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedLevel(opt.value)}
                    className={`p-2.5 rounded-xl border-2 text-center transition-all ${
                      selectedLevel === opt.value
                        ? "border-sakura-400 bg-sakura-50 dark:bg-sakura-950/50 dark:border-sakura-700"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="text-lg">{opt.icon}</div>
                    <div className={`text-xs font-black mt-0.5 ${selectedLevel === opt.value ? "text-sakura-600 dark:text-sakura-400" : "text-slate-700 dark:text-slate-300"}`}>
                      {opt.value}
                    </div>
                    <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Goal Selection */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Mục tiêu học tập
              </label>
              <div className="grid grid-cols-2 gap-2">
                {GOAL_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedGoal(opt.value)}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all ${
                      selectedGoal === opt.value
                        ? "border-fuji-400 bg-fuji-50 dark:bg-fuji-950/50 dark:border-fuji-700"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xl">{opt.icon}</span>
                    <span className={`text-xs font-bold ${selectedGoal === opt.value ? "text-fuji-600 dark:text-fuji-400" : "text-slate-600 dark:text-slate-300"}`}>
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Daily Goal */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                ⏱️ Thời gian học mỗi ngày
              </label>
              <div className="flex gap-2">
                {[10, 15, 30, 60].map((min) => (
                  <label key={min} className="flex-1 cursor-pointer">
                    <input type="radio" name="dailyGoalMinutes" value={min} defaultChecked={min === 15} className="sr-only peer" />
                    <div className="text-center p-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 peer-checked:border-amber-400 peer-checked:bg-amber-50 dark:peer-checked:bg-amber-950/30 dark:peer-checked:border-amber-700 transition-all text-xs font-bold text-slate-600 dark:text-slate-300 peer-checked:text-amber-700 dark:peer-checked:text-amber-300">
                      {min}p
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 px-4 py-3 flex items-center gap-2">
                <span className="text-rose-500">⚠️</span>
                <p role="alert" className="text-sm font-bold text-rose-700 dark:text-rose-300">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sakura-500 via-rose-500 to-sakura-600 text-white font-black text-sm tracking-wide shadow-lg shadow-sakura-500/30 hover:shadow-xl hover:shadow-sakura-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang tạo tài khoản...
                </span>
              ) : (
                "🌸 Bắt Đầu Hành Trình！"
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-500">
              Đã có tài khoản？{" "}
              <Link href="/login" className="font-black text-sakura-500 hover:text-sakura-600 hover:underline transition">
                Đăng nhập ngay ⛩️
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
