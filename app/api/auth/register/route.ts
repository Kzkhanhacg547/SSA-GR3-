import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(1).max(50),
  learningLevel: z.string().optional().default("N5"),
  learningGoal: z.string().optional().default("TRAVEL"),
  dailyGoalMinutes: z.number().min(5).max(180).optional().default(15),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu đăng ký không hợp lệ." }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Email này đã được đăng ký tài khoản." }, { status: 409 });

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: parsed.data.displayName,
      learningLevel: parsed.data.learningLevel,
      learningGoal: parsed.data.learningGoal,
      dailyGoalMinutes: parsed.data.dailyGoalMinutes,
      profile: { create: { displayName: parsed.data.displayName } },
    },
  });
  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
}

