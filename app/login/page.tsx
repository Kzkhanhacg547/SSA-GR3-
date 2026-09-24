"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { NihonQuestLogo } from "@/components/NihonQuestLogo";

function RegisteredNotice() {
  const params = useSearchParams();
  if (!params.get("registered")) return null;
  return (
    <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-4 py-3 flex items-center gap-2">
      <span className="text-emerald-500 text-lg">✅</span>
      <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Tài khoản đã tạo thành công! Hãy đăng nhập để bắt đầu hành trình！</p>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const data = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      redirect: false,
      email: String(data.get("email") || ""),
      password: String(data.get("password") || ""),
    });
    if (res?.error) {
      setError("Email hoặc mật khẩu không đúng. Vui lòng thử lại！");
      setLoading(false);
      return;
    }
    router.push("/app");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Email */}
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
            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-sumi-900 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sakura-400 dark:focus:border-sakura-700 transition"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Mật khẩu
          </label>
          <Link href="/forgot-password" className="text-xs font-bold text-sakura-500 hover:text-sakura-600 hover:underline transition">
            Quên mật khẩu？
          </Link>
        </div>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔒</span>
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            required
            placeholder="••••••••"
            className="w-full pl-10 pr-12 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-sumi-900 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sakura-400 dark:focus:border-sakura-700 transition"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition text-lg"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
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
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sakura-500 via-rose-500 to-sakura-600 text-white font-black text-sm tracking-wide shadow-lg shadow-sakura-500/30 hover:shadow-xl hover:shadow-sakura-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Đang đăng nhập...
          </span>
        ) : (
          "⛩️ Bắt Đầu Hành Trình"
        )}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-sakura-50/30 to-rose-50/20 dark:from-slate-950 dark:via-sumi-950 dark:to-slate-950">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-sakura-300/20 dark:bg-sakura-900/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-rose-300/20 dark:bg-rose-900/10 rounded-full blur-3xl" />
        {/* Floating Japanese characters */}
        {["桜", "日", "本", "語", "愛"].map((char, i) => (
          <div
            key={i}
            className="absolute text-sakura-200 dark:text-sakura-900/50 font-black opacity-40 select-none"
            style={{
              fontSize: `${60 + i * 20}px`,
              top: `${10 + i * 18}%`,
              left: `${5 + i * 18}%`,
              transform: `rotate(${-20 + i * 10}deg)`,
            }}
          >
            {char}
          </div>
        ))}
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Link href="/" className="inline-block mb-3 hover:scale-105 transition-transform">
            <NihonQuestLogo size="lg" />
          </Link>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Hành trình chinh phục tiếng Nhật thông minh của bạn
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/90 dark:bg-sumi-950/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl shadow-slate-900/10 dark:shadow-slate-900/50 p-8 space-y-6">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Chào mừng trở lại！</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Đăng nhập để tiếp tục hành trình học tiếng Nhật</p>
          </div>

          <Suspense>
            <RegisteredNotice />
          </Suspense>

          <LoginForm />

          <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-500">
              Chưa có tài khoản？{" "}
              <Link href="/register" className="font-black text-sakura-500 hover:text-sakura-600 hover:underline transition">
                Tạo tài khoản miễn phí 🌸
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
