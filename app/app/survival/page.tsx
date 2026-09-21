import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { AppNav } from "@/components/AppNav";
import { PageTitle } from "@/components/ui";
import { SurvivalClient } from "./SurvivalClient";

export default async function SurvivalPage() {
  const session = await getServerSession(authOptions);
  const uid = (session?.user as { id?: string } | undefined)?.id;
  if (!uid) redirect("/login");

  const scenarios = await prisma.scenario.findMany({
    where: { isPublished: true },
    include: {
      messages: { orderBy: { order: "asc" } },
      choices: true,
      progress: { where: { userId: uid } },
    },
  });

  const formattedScenarios = scenarios.map((sc) => ({
    id: sc.id,
    slug: sc.slug,
    title: sc.title,
    description: sc.description,
    level: sc.level,
    xpReward: sc.xpReward,
    messages: sc.messages.map((m) => ({
      id: m.id,
      order: m.order,
      speaker: m.speaker,
      japanese: m.japanese,
      romaji: m.romaji,
      meaning: m.meaning,
    })),
    choices: sc.choices.map((c) => ({
      id: c.id,
      optionText: c.optionText,
      isIdeal: c.isIdeal,
      xpReward: c.xpReward,
    })),
    isCompleted: sc.progress.some((p) => p.status === "COMPLETED"),
  }));

  return (
    <div className="space-y-6">
      <AppNav />
      <PageTitle
        title="Chế Độ Sinh Tồn (Survival Mode)"
        subtitle="Rèn luyện phản xạ giao tiếp tiếng Nhật trong các tình huống thực tế đời thường."
        badge="N5 Thực Chiến"
      />
      <SurvivalClient scenarios={formattedScenarios} />
    </div>
  );
}
