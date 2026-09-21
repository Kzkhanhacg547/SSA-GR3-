import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { AppNav } from "@/components/AppNav";
import { PageTitle } from "@/components/ui";
import { LeaderboardClient } from "./LeaderboardClient";

export const metadata = { title: "Bảng Xếp Hạng — Nihon Quest" };

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions);
  const uid = (session?.user as { id?: string } | undefined)?.id;
  if (!uid) redirect("/login");

  // Fetch all users with profile
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      totalXP: true,
      level: true,
      currentStreak: true,
      profile: { select: { displayName: true, avatar: true } },
    },
    orderBy: { totalXP: "desc" },
    take: 50,
  });

  // Calculate Weekly XP (Last 7 days transactions)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weeklyTransactions = await prisma.xpTransaction.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    select: { userId: true, amount: true },
  });

  const weeklyXpMap = new Map<string, number>();
  weeklyTransactions.forEach((t) => {
    weeklyXpMap.set(t.userId, (weeklyXpMap.get(t.userId) || 0) + t.amount);
  });

  const allTimeFormatted = allUsers.map((u) => ({
    id: u.id,
    name: u.name,
    displayName: u.profile?.displayName || u.name,
    avatar: u.profile?.avatar || null,
    xp: u.totalXP,
    level: u.level,
    currentStreak: u.currentStreak,
  }));

  const weeklyFormatted = allUsers
    .map((u) => ({
      id: u.id,
      name: u.name,
      displayName: u.profile?.displayName || u.name,
      avatar: u.profile?.avatar || null,
      xp: weeklyXpMap.get(u.id) || 0,
      level: u.level,
      currentStreak: u.currentStreak,
    }))
    .sort((a, b) => b.xp - a.xp);

  const totalUsers = await prisma.user.count();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <AppNav />
      <PageTitle
        title="Bảng Xếp Hạng & Giải Đấu"
        subtitle="Thi đua học tập công bằng mỗi tuần. Càng kiên trì rèn luyện, thứ hạng càng thăng tiến！"
        badge={`${totalUsers} học viên`}
      />
      <LeaderboardClient
        currentUserId={uid}
        weeklyUsers={weeklyFormatted}
        allTimeUsers={allTimeFormatted}
      />
    </div>
  );
}
