import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const topQuestions = await prisma.analytics.findMany({
      orderBy: {
        count: "desc",
      },
      take: 10,
    });

    const totalQuestions = await prisma.analytics.aggregate({
      _sum: {
        count: true,
      },
    });

    const totalKnowledgeEntries = await prisma.knowledgeBase.count();

    return NextResponse.json({
      topQuestions: topQuestions || [],
      totalQuestions: totalQuestions._sum.count || 0,
      totalKnowledgeEntries: totalKnowledgeEntries || 0,
    });
  } catch (error: any) {
    console.error("Analytics error:", error);
    // Return empty data instead of error to prevent UI crashes
    return NextResponse.json({
      topQuestions: [],
      totalQuestions: 0,
      totalKnowledgeEntries: 0,
    });
  }
}

