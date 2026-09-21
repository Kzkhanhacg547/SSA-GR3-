import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkAnswer, scoreQuiz } from "@/lib/quiz";

const schema = z.object({
  lessonId: z.string(),
  answers: z.array(z.object({ exerciseId: z.string(), answer: z.string(), timeSpent: z.number().min(0).max(3600).default(0) })),
});

export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid submission." }, { status: 400 });

  const lesson = await prisma.lesson.findUnique({
    where: { id: parsed.data.lessonId },
    include: { exercises: true },
  });
  if (!lesson) return NextResponse.json({ error: "Lesson not found." }, { status: 404 });

  const existing = await prisma.userLessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId: lesson.id } },
  });

  const byId = new Map(lesson.exercises.map((e) => [e.id, e]));
  const graded = parsed.data.answers.map((a) => {
    const ex = byId.get(a.exerciseId);
    if (!ex) return null;
    const isCorrect = checkAnswer(ex.correctAnswer, a.answer);
    return { exerciseId: ex.id, isCorrect, points: ex.points, answer: a.answer, timeSpent: a.timeSpent };
  }).filter(Boolean) as Array<{ exerciseId: string; isCorrect: boolean; points: number; answer: string; timeSpent: number }>;

  for (const g of graded) {
    await prisma.exerciseAttempt.create({
      data: { userId, exerciseId: g.exerciseId, lessonId: lesson.id, isCorrect: g.isCorrect, userAnswer: g.answer, timeSpent: g.timeSpent },
    });

    if (!g.isCorrect) {
      const ex = byId.get(g.exerciseId);
      const contentType = ex?.contentType || "EXERCISE";
      const contentId = ex?.contentId || g.exerciseId;

      await prisma.reviewItem.upsert({
        where: {
          userId_contentType_contentId: {
            userId,
            contentType,
            contentId,
          },
        },
        update: {
          dueAt: new Date(),
          interval: 0,
          repetitions: 0,
        },
        create: {
          userId,
          contentType,
          contentId,
          ease: 2.5,
          interval: 0,
          repetitions: 0,
          dueAt: new Date(),
        },
      });
    }
  }

  const summary = scoreQuiz(graded);
  const score = Math.round(summary.accuracy * 100);
  const bestScore = existing?.score != null ? Math.max(existing.score, score) : score;
  const bestAccuracy = existing?.accuracy != null ? Math.max(existing.accuracy, summary.accuracy) : summary.accuracy;

  const progress = await prisma.userLessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId: lesson.id } },
    update: { status: "COMPLETED", score: bestScore, accuracy: bestAccuracy, completedAt: new Date() },
    create: { userId, lessonId: lesson.id, status: "COMPLETED", score, accuracy: summary.accuracy, completedAt: new Date() },
  });

  const isPriorCompleted = existing?.status === "COMPLETED";
  let xpAwarded = 0;

  // Idempotent XP: referenceId lessonId means one reward per lesson.
  const priorXp = await prisma.xpTransaction.findFirst({ where: { userId, reason: "LESSON_COMPLETE", referenceId: lesson.id } });
  if (!priorXp) {
    xpAwarded = lesson.xpReward;
    await prisma.xpTransaction.create({ data: { userId, amount: lesson.xpReward, reason: "LESSON_COMPLETE", referenceId: lesson.id } });
    await prisma.user.update({ where: { id: userId }, data: { totalXP: { increment: lesson.xpReward }, lastActivityAt: new Date() } });
  }

  // Update daily mission
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { timezone: true } });
  const todayKey = new Date().toISOString().slice(0, 10);
  await prisma.userDailyMission.updateMany({
    where: { userId, date: todayKey, mission: { type: "LESSON" }, status: "IN_PROGRESS" },
    data: { progress: { increment: 1 } },
  });

  return NextResponse.json({ ok: true, summary, score, bestScore, xpAwarded, isPriorCompleted, progressId: progress.id });
}
