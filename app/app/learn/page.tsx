import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { AppNav } from "@/components/AppNav";
import { PageTitle } from "@/components/ui";
import { KanaLab } from "./KanaLab";

export default async function LearnPage() {
  const session = await getServerSession(authOptions);
  const uid = (session?.user as { id?: string } | undefined)?.id;
  if (!uid) redirect("/login");
  const kana = await prisma.kana.findMany({ orderBy: [{ script: "asc" }, { row: "asc" }, { romaji: "asc" }] });
  const practiced = await prisma.reviewItem.findMany({ where: { userId: uid, contentType: "KANA" } });
  const done = new Set(practiced.map((p) => p.contentId));

  return (
    <div className="space-y-6">
      <AppNav />
      <PageTitle title="Kana Lab — Bảng Chữ Cái" subtitle="Luyện tập 46 ký tự Hiragana và Katakana kèm phát âm chuẩn bản xứ. Mỗi ký tự luyện xong được ghi nhớ theo thuật toán SRS." />
      <KanaLab kana={kana} practiced={Array.from(done)} />
    </div>
  );
}
