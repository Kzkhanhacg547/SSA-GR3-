import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canUnlockJourney } from "@/lib/journey";

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const locations = await prisma.journeyLocation.findMany({ orderBy: { order: "asc" } });
  const progress = await prisma.userJourneyProgress.findMany({ where: { userId } });
  const byId = new Map(progress.map((p) => [p.locationId, p]));

  // Ensure Tokyo starts AVAILABLE; everything else LOCKED until unlocked server-side.
  for (const loc of locations) {
    if (!byId.has(loc.id)) {
      const created = await prisma.userJourneyProgress.create({
        data: { userId, locationId: loc.id, status: loc.order === 0 ? "AVAILABLE" : "LOCKED" },
      });
      byId.set(loc.id, created);
    }
  }
  const ordered = locations.map((loc, i) => {
    const prev = i === 0 ? null : locations[i - 1];
    const prevProgress = prev ? byId.get(prev.id) : null;
    const unlockable = canUnlockJourney({
      locationOrder: loc.order,
      requirementXp: loc.requirementXp,
      totalXP: user.totalXP,
      previousCompleted: i === 0 || prevProgress?.status === "COMPLETED",
    });
    return { location: loc, progress: byId.get(loc.id), unlockable };
  });
  return NextResponse.json(ordered);
}
