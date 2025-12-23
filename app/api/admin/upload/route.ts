import { NextRequest, NextResponse } from "next/server";
import { parseExcelFile, saveKnowledgeEntries } from "@/lib/knowledge";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (
      !file.name.endsWith(".xlsx") &&
      !file.name.endsWith(".xls") &&
      file.type !==
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload an Excel file (.xlsx)" },
        { status: 400 }
      );
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse Excel file
    const entries = await parseExcelFile(buffer);

    if (entries.length === 0) {
      return NextResponse.json(
        { error: "No valid entries found in the Excel file" },
        { status: 400 }
      );
    }

    // Save to database
    await saveKnowledgeEntries(entries);

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${entries.length} knowledge entries`,
      entries: entries.length,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error: "Failed to process file",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

