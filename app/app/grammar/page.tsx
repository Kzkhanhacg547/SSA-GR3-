import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { AppNav } from "@/components/AppNav";
import { PageTitle } from "@/components/ui";
import { GrammarClient } from "./GrammarClient";

export const metadata = { title: "Ngữ Pháp JLPT — Nihon Quest" };

export default async function GrammarPage() {
  const session = await getServerSession(authOptions);
  const uid = (session?.user as { id?: string } | undefined)?.id;
  if (!uid) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: uid }, select: { learningLevel: true } });
  const userLevel = user?.learningLevel ?? "N5";

  const grammar = await prisma.grammar.findMany({
    include: { examples: { orderBy: { id: "asc" } } },
    orderBy: [{ level: "asc" }, { title: "asc" }],
  });

  const serialized = grammar.map((g) => ({
    id: g.id,
    title: g.title,
    level: g.level,
    meaning: g.meaning,
    structure: g.structure,
    commonMistakes: g.commonMistakes,
    examples: g.examples.map((e) => ({
      id: e.id,
      japanese: e.japanese,
      romaji: e.romaji,
      meaning: e.meaning,
    })),
  }));

  const LEVEL_LABELS: Record<string, string> = { N5: "N5 Cơ Bản", N4: "N4 Sơ Trung Cấp", N3: "N3 Trung Cấp" };
  const levelCount = grammar.filter((g) => g.level === userLevel).length;

  return (
    <div className="space-y-6">
      <AppNav />
      <PageTitle
        title={`Ngữ Pháp JLPT — Grammar Lab`}
        subtitle={`Hệ thống ngữ pháp theo lộ trình JLPT cá nhân hoá của bạn với giải thích chi tiết, ví dụ thực tế và phát âm chuẩn.`}
        badge={`${levelCount} điểm ngữ pháp ${LEVEL_LABELS[userLevel] ?? userLevel}`}
      />
      <GrammarClient grammar={serialized} defaultLevel={userLevel} />
    </div>
  );
}

