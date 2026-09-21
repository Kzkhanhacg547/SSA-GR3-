"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button } from "@/components/ui";
import { useSoundAndTheme } from "@/components/SoundAndThemeContext";

export function ProfileForm({
  initial,
}: {
  initial: {
    displayName: string;
    learningLevel: string;
    learningGoal: string;
    dailyGoalMinutes: number;
    timezone: string;
    theme: string;
    soundEnabled: boolean;
  };
}) {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const { playClick, playCorrect, showToast } = useSoundAndTheme();

  async function save(e: React.FormEvent) {
    e.preventDefault();
    playClick();
    setBusy(true);

    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json().catch(() => ({}));
      setBusy(false);

      if (!res.ok) {
        showToast({ title: json.error ?? "Lưu cài đặt thất bại", type: "error" });
        return;
      }

      applyTheme(form.theme);
      playCorrect();
      showToast({
        title: "Đã lưu cài đặt thành công! ✨",
        description: `Lộ trình học đã cập nhật theo cấp độ ${form.learningLevel}.`,
        type: "success",
      });

      router.refresh();
    } catch {
      setBusy(false);
      showToast({ title: "Đã có lỗi xảy ra, vui lòng thử lại.", type: "error" });
    }
  }

  function applyTheme(theme: string) {
    const dark =
      theme === "dark" ||
      (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  }

  return (
    <Card className="p-6">
      <h3 className="text-base font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <span>⚙️</span> Cài Đặt Hồ Sơ & Lộ Trình Học
      </h3>

      <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Tên hiển thị
          </label>
          <input
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-sumi-900 p-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-sakura-500"
            placeholder="Nhập tên của bạn"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Múi giờ (Timezone)
          </label>
          <input
            value={form.timezone}
            onChange={(e) => setForm({ ...form, timezone: e.target.value })}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-sumi-900 p-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-sakura-500"
            placeholder="Asia/Ho_Chi_Minh"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Cấp độ JLPT trọng tâm
          </label>
          <select
            value={form.learningLevel}
            onChange={(e) => setForm({ ...form, learningLevel: e.target.value })}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-sumi-900 p-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-sakura-500 font-bold text-sakura-600 dark:text-sakura-400"
          >
            <option value="N5">N5 — Cơ bản (Nhập môn Kana & Giao tiếp nền tảng)</option>
            <option value="N4">N4 — Sơ Trung Cấp (Biến thể động từ & Câu điều kiện)</option>
            <option value="N3">N3 — Trung Cấp (Sắc thái ngữ pháp & Công sở)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Mục tiêu học tập chính
          </label>
          <select
            value={form.learningGoal}
            onChange={(e) => setForm({ ...form, learningGoal: e.target.value })}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-sumi-900 p-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-sakura-500"
          >
            <option value="JLPT">Thi đỗ chứng chỉ JLPT</option>
            <option value="TRAVEL">Du lịch & Khám phá Nhật Bản</option>
            <option value="CONVERSATION">Giao tiếp thực tế hàng ngày</option>
            <option value="CULTURE">Văn hóa, Anime & Manga</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Mục tiêu thời gian mỗi ngày (phút)
          </label>
          <input
            type="number"
            min={5}
            max={180}
            value={form.dailyGoalMinutes}
            onChange={(e) => setForm({ ...form, dailyGoalMinutes: Number(e.target.value) })}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-sumi-900 p-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-sakura-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Giao diện (Theme)
          </label>
          <select
            value={form.theme}
            onChange={(e) => setForm({ ...form, theme: e.target.value })}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-sumi-900 p-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-sakura-500"
          >
            <option value="light">Sáng (Light)</option>
            <option value="dark">Tối (Dark Sumi)</option>
            <option value="system">Theo hệ thống (System)</option>
          </select>
        </div>

        <div className="sm:col-span-2 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={form.soundEnabled}
              onChange={(e) => setForm({ ...form, soundEnabled: e.target.checked })}
              className="w-4 h-4 rounded text-sakura-600 focus:ring-sakura-500"
            />
            Bật âm thanh hiệu ứng (Sound Effects) 🔊
          </label>

          <Button
            type="submit"
            variant="sakura"
            disabled={busy}
            className="font-black px-6"
          >
            {busy ? "Đang lưu..." : "💾 Lưu cài đặt"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

