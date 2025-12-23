import { prisma } from "./prisma";
import { safeDbOperation, getPrisma } from "./safe-prisma";
import * as XLSX from "xlsx";

export interface KnowledgeEntry {
  id?: string;
  category: string;
  question?: string;
  answer: string;
  source: string;
}

export async function searchKnowledgeBase(query: string, limit: number = 5): Promise<KnowledgeEntry[]> {
  // Return empty if no database connection
  if (!process.env.DATABASE_URL) {
    return [];
  }
  
  try {
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return [];
    }

    const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
    
    if (searchTerms.length === 0) {
      // If no search terms, return some general entries
      const generalResults = await safeDbOperation(
        async (p) => await p.knowledgeBase.findMany({
          take: limit,
          orderBy: {
            createdAt: "desc",
          },
        }),
        []
      );
      
      return generalResults.map((entry) => ({
        id: entry.id.toString(),
        category: entry.category,
        question: entry.question || undefined,
        answer: entry.answer,
        source: entry.source,
      }));
    }

    // Search in question and answer fields
    const results = await prisma.knowledgeBase.findMany({
      where: {
        OR: [
          {
            question: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            answer: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            category: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      take: limit,
    });

    return results.map((entry) => ({
      id: entry.id.toString(),
      category: entry.category,
      question: entry.question || undefined,
      answer: entry.answer,
      source: entry.source,
    }));
  } catch (error) {
    console.error("Knowledge base search error:", error);
    return [];
  }
}

export async function getAllKnowledge(): Promise<KnowledgeEntry[]> {
  const results = await safeDbOperation(
    async (p) => await p.knowledgeBase.findMany({
      orderBy: {
        category: "asc",
      },
    }),
    []
  );

  return results.map((entry) => ({
    id: entry.id.toString(),
    category: entry.category,
    question: entry.question || undefined,
    answer: entry.answer,
    source: entry.source,
  }));
}

export async function parseExcelFile(fileBuffer: Buffer): Promise<KnowledgeEntry[]> {
  try {
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error("Excel file has no sheets");
    }
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    if (!worksheet) {
      throw new Error("Could not read worksheet from Excel file");
    }
    
    const data = XLSX.utils.sheet_to_json(worksheet) as any[];
    
    if (!data || data.length === 0) {
      throw new Error("Excel file is empty or has no data rows");
    }

    const entries: KnowledgeEntry[] = [];

    for (const row of data) {
      try {
        // Try multiple column name variations (case-insensitive)
        const category = row.Category || row.category || row["Category"] || row["category"] || 
                        row.CATEGORY || row["CATEGORY"] || "General";
        const question = row.Question || row.question || row["Question"] || row["question"] || 
                        row.QUESTION || row["QUESTION"] || null;
        const answer = row.Answer || row.answer || row["Answer"] || row["answer"] || 
                      row.ANSWER || row["ANSWER"] || "";

        // Check if answer exists and is not empty
        const answerStr = String(answer || "").trim();
        if (answerStr.length > 0) {
          entries.push({
            category: String(category || "General").trim(),
            question: question ? String(question).trim() : undefined,
            answer: answerStr,
            source: "excel",
          });
        }
      } catch (rowError) {
        console.error("Error parsing row:", rowError);
        // Skip this row and continue
      }
    }

    if (entries.length === 0) {
      throw new Error("No valid entries found. Please ensure your Excel file has 'Category' and 'Answer' columns with data.");
    }

    return entries;
  } catch (error: any) {
    console.error("Excel parsing error:", error);
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
}

export async function saveKnowledgeEntries(entries: KnowledgeEntry[]): Promise<void> {
  try {
    for (const entry of entries) {
      try {
        // Check if entry exists
        const existing = await prisma.knowledgeBase.findFirst({
          where: {
            category: entry.category,
            question: entry.question || null,
            answer: entry.answer,
          },
        });

        if (existing) {
          // Update existing entry
          await prisma.knowledgeBase.update({
            where: { id: existing.id },
            data: {
              category: entry.category,
              question: entry.question || null,
              answer: entry.answer,
              source: entry.source,
            },
          });
        } else {
          // Create new entry
          await prisma.knowledgeBase.create({
            data: {
              category: entry.category,
              question: entry.question || null,
              answer: entry.answer,
              source: entry.source,
            },
          });
        }
      } catch (entryError: any) {
        console.error(`Error saving entry: ${entry.category}`, entryError);
        // Continue with next entry even if one fails
      }
    }
  } catch (error: any) {
    console.error("Error in saveKnowledgeEntries:", error);
    throw new Error(`Failed to save knowledge entries: ${error.message}`);
  }
}

export async function logAnalytics(question: string): Promise<void> {
  // Limit question length to prevent database errors
  const truncatedQuestion = question.substring(0, 500);
  
  await safeDbOperation(
    async (p) => await p.analytics.upsert({
      where: {
        question: truncatedQuestion,
      },
      update: {
        count: {
          increment: 1,
        },
        lastAsked: new Date(),
      },
      create: {
        question: truncatedQuestion,
        count: 1,
        lastAsked: new Date(),
      },
    }),
    undefined
  );
}

