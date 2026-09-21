"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { useSoundAndTheme } from "@/components/SoundAndThemeContext";

export function ActivityButton() {
  const router = useRouter();
  const { playCorrect, showToast } = useSoundAndTheme();
  const [loading, setLoading] = useState(false);

  async function touch() {
    setLoading(true);
    try {
      const res = await fetch("/api/activity", { method: "POST" });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        playCorrect();
        showToast({
          title: `Điểm danh hôm nay thành công! 🔥`,
          description: `Chuỗi hiện tại: ${json.currentStreak} ngày · Cấp độ: ${json.level}!`,
          type: "xp",
        });
        router.refresh();
      }
    } catch {}
    setLoading(false);
  }

  return (
    <Button
      variant="gold"
      size="sm"
      loading={loading}
      onClick={touch}
      className="mt-3 w-full font-bold shadow-sm"
    >
      🔥 Điểm danh chuỗi ngày
    </Button>
  );
}
