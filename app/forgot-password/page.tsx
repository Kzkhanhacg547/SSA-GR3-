"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate a small delay for UX
    await new Promise((r) => setTimeout(r, 800));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-fuji-50/20 to-sakura-50/20 dark:from-slate-950 dark:via-sumi-950 dark:to-slate-950">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-fuji-300/20 dark:bg-fuji-900/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-fuji-500 to-sakura-500 shadow-xl shadow-fuji-500/40 mb-3">
            <span className="text-xl font-black text-white">🔑</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Khôi Phục Mật Khẩu</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Nhập email và chúng tôi sẽ hướng dẫn bạn đặt lại mật khẩu
          </p>
        </div>

        <div className="bg-white/90 dark:bg-sumi-950/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl p-8 space-y-6">
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">📧</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-sumi-900 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-fuji-400 dark:focus:border-fuji-700 transition"
                  />
                </div>
              </div>

              <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 px-4 py-3">
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  💡 <strong>Lưu ý:</strong> Trong phiên bản hiện tại, tính năng gửi email đặt lại mật khẩu đang được phát triển. 
                  Tài khoản của bạn vẫn an toàn. Liên hệ quản trị viên để được hỗ trợ thủ công.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-fuji-500 to-sakura-500 text-white font-black text-sm tracking-wide shadow-lg shadow-fuji-500/30 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang xử lý...
                  </span>
                ) : (
                  "📨 Gửi Yêu Cầu Đặt Lại"
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4 py-4">
              <div className="text-5xl">✉️</div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-lg">Yêu cầu đã được ghi nhận！</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Chúng tôi đã nhận được yêu cầu khôi phục mật khẩu cho email{" "}
                  <strong className="text-slate-700 dark:text-slate-200">{email}</strong>.
                  Đội ngũ hỗ trợ sẽ liên hệ và hướng dẫn bạn trong thời gian sớm nhất.
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-4 py-3">
                <p className="text-xs text-emerald-700 dark:text-emerald-300 font-bold">
                  ✅ Trong lúc chờ đợi, bạn vẫn có thể đăng nhập nếu nhớ ra mật khẩu cũ！
                </p>
              </div>
            </div>
          )}

          <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/login"
              className="text-sm font-bold text-sakura-500 hover:text-sakura-600 hover:underline transition"
            >
              ← Quay về Đăng Nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
