import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateLevel } from "@/lib/level";
import { updateStreak } from "@/lib/streak";

export async function POST() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const now = new Date();
  const streak = updateStreak({
    lastActivityAt: user.lastActivityAt,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    now,
    timezone: user.timezone,
  });
  const level = calculateLevel(user.totalXP).level;
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { currentStreak: streak.currentStreak, longestStreak: streak.longestStreak, lastActivityAt: now, level },
  });
  return NextResponse.json({ currentStreak: updated.currentStreak, longestStreak: updated.longestStreak, level: updated.level });
}
