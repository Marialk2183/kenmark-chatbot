import { NextResponse } from "next/server";
import { safeDbOperation } from "@/lib/safe-prisma";

export async function GET() {
  const topQuestions = await safeDbOperation(
    async (p) => await p.analytics.findMany({
      orderBy: {
        count: "desc",
      },
      take: 10,
    }),
    []
  );

  const totalQuestions = await safeDbOperation(
    async (p) => await p.analytics.aggregate({
      _sum: {
        count: true,
      },
    }),
    { _sum: { count: 0 } }
  );

  const totalKnowledgeEntries = await safeDbOperation(
    async (p) => await p.knowledgeBase.count(),
    0
  );

  return NextResponse.json({
    topQuestions: topQuestions || [],
    totalQuestions: totalQuestions._sum?.count || 0,
    totalKnowledgeEntries: totalKnowledgeEntries || 0,
  });
}

