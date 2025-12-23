import { NextRequest, NextResponse } from "next/server";
import { getAllKnowledge } from "@/lib/knowledge";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const knowledge = await getAllKnowledge();
    return NextResponse.json({ knowledge });
  } catch (error: any) {
    console.error("Knowledge fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch knowledge base",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }

    const idNumber = parseInt(id, 10);
    if (isNaN(idNumber)) {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }

    await prisma.knowledgeBase.delete({
      where: { id: idNumber },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete entry",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

