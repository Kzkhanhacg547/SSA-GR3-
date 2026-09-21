import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { AppNav } from "@/components/AppNav";
import { QuizRunner } from "./QuizRunner";

export default async function LessonRunnerPage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  const uid = (session?.user as { id?: string } | undefined)?.id;
  if (!uid) redirect("/login");
  const lesson = await prisma.lesson.findUnique({
    where: { slug: params.slug },
    include: { exercises: { orderBy: { order: "asc" }, include: { options: { orderBy: { order: "asc" } } } } },
  });
  if (!lesson) notFound();

  const nextLesson = await prisma.lesson.findFirst({
    where: { isPublished: true, order: { gt: lesson.order } },
    orderBy: { order: "asc" },
    select: { id: true, slug: true, title: true, level: true, xpReward: true },
  });

  return (
    <div className="space-y-6">
      <AppNav />
      <QuizRunner
        lesson={JSON.parse(JSON.stringify(lesson))}
        nextLesson={nextLesson ? JSON.parse(JSON.stringify(nextLesson)) : null}
      />
    </div>
  );
}
