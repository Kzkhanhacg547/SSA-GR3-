import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { AppNav } from "@/components/AppNav";
import { Card, PageTitle } from "@/components/ui";
import { ProfileForm } from "./ProfileForm";
import { PasswordForm } from "./PasswordForm";
import { DangerZone } from "./DangerZone";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const uid = (session?.user as { id?: string } | undefined)?.id;
  if (!uid) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: uid }, include: { profile: true } });
  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <AppNav />
      <PageTitle title="Hồ Sơ &amp; Cài Đặt" subtitle="Cá nhân hoá lộ trình học tập, mục tiêu JLPT và giao diện theo sở thích của bạn." />
      <Card>
        <p className="text-sm text-slate-600 dark:text-slate-300">Đăng nhập với email</p>
        <p className="font-semibold">{user.email}</p>
      </Card>
      <ProfileForm
        initial={{
          displayName: user.profile?.displayName ?? user.name ?? "",
          learningLevel: user.learningLevel,
          learningGoal: user.learningGoal,
          dailyGoalMinutes: user.dailyGoalMinutes,
          timezone: user.timezone,
          theme: user.theme,
          soundEnabled: user.soundEnabled,
        }}
      />
      <PasswordForm />
      <DangerZone />
    </div>
  );
}
