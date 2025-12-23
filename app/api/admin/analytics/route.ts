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
      topQuestions,
      totalQuestions: totalQuestions._sum.count || 0,
      totalKnowledgeEntries,
    });
  } catch (error: any) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch analytics",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

