import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { AppNav } from "@/components/AppNav";
import { PageTitle } from "@/components/ui";
import { JourneyClient } from "./JourneyClient";
import { canUnlockJourney } from "@/lib/journey";

export default async function JourneyPage() {
  const session = await getServerSession(authOptions);
  const uid = (session?.user as { id?: string } | undefined)?.id;
  if (!uid) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: uid } });
  if (!user) redirect("/login");
  const locations = await prisma.journeyLocation.findMany({ orderBy: { order: "asc" } });
  const progress = await prisma.userJourneyProgress.findMany({ where: { userId: uid } });
  const byId = new Map(progress.map((p) => [p.locationId, p]));

  // Ensure default progress rows exist (Tokyo AVAILABLE, others LOCKED)
  for (const loc of locations) {
    if (!byId.has(loc.id)) {
      const created = await prisma.userJourneyProgress.create({
        data: { userId: uid, locationId: loc.id, status: loc.order === 0 ? "AVAILABLE" : "LOCKED" },
      });
      byId.set(loc.id, created);
    }
  }

  const achievements = await prisma.userAchievement.findMany({ where: { userId: uid }, include: { achievement: true } });

  const rows = locations.map((loc, i) => {
    const prev = i === 0 ? null : locations[i - 1];
    const prevStatus = prev ? byId.get(prev.id)?.status : null;
    return {
      location: JSON.parse(JSON.stringify(loc)),
      progress: byId.get(loc.id) ? JSON.parse(JSON.stringify(byId.get(loc.id))) : null,
      unlockable: canUnlockJourney({
        locationOrder: loc.order,
        requirementXp: loc.requirementXp,
        totalXP: user.totalXP,
        previousCompleted: i === 0 || prevStatus === "COMPLETED",
      }),
    };
  });

  return (
    <div className="space-y-6">
      <AppNav />
      <PageTitle title="Hành Trình Nhật Bản 🗾" subtitle="Chinh phục từng chặng Shinkansen từ Tokyo đến Hokkaido. Hoàn thành bài học, tích lũy XP để mở khoá danh thắng và nhận hộ chiếu đặc biệt." />
      <JourneyClient rows={rows} achievements={JSON.parse(JSON.stringify(achievements))} />
    </div>
  );
}
