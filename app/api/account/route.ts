import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  learningLevel: z.string().optional(),
  learningGoal: z.string().optional(),
  dailyGoalMinutes: z.number().min(5).max(180).optional(),
  timezone: z.string().optional(),
  theme: z.string().optional(),
  soundEnabled: z.boolean().optional(),
  onboardingCompleted: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: parsed.data.displayName,
      learningLevel: parsed.data.learningLevel,
      learningGoal: parsed.data.learningGoal,
      dailyGoalMinutes: parsed.data.dailyGoalMinutes,
      timezone: parsed.data.timezone,
      theme: parsed.data.theme,
      soundEnabled: parsed.data.soundEnabled,
      onboardingCompleted: parsed.data.onboardingCompleted,
      profile: parsed.data.displayName
        ? { upsert: { create: { displayName: parsed.data.displayName }, update: { displayName: parsed.data.displayName } } }
        : undefined,
    },
    include: { profile: true },
  });
  const { passwordHash: _omit, ...safe } = user;
  return NextResponse.json(safe);
}

export async function DELETE() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ ok: true });
}
