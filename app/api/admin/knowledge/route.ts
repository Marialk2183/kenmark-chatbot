import { NextRequest, NextResponse } from "next/server";
import { getAllKnowledge } from "@/lib/knowledge";
import { safeDbOperation } from "@/lib/safe-prisma";

export async function GET() {
  const knowledge = await getAllKnowledge();
  return NextResponse.json({ knowledge: knowledge || [] });
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

    const deleted = await safeDbOperation(
      async (p) => {
        await p.knowledgeBase.delete({
          where: { id: idNumber },
        });
        return true;
      },
      false
    );

    if (!deleted) {
      return NextResponse.json(
        { error: "Failed to delete entry. Database may be unavailable." },
        { status: 500 }
      );
    }

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

