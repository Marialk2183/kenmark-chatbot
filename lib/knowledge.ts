import { prisma } from "./prisma";
import * as XLSX from "xlsx";

export interface KnowledgeEntry {
  category: string;
  question?: string;
  answer: string;
  source: string;
}

export async function searchKnowledgeBase(query: string, limit: number = 5): Promise<KnowledgeEntry[]> {
  const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
  
  if (searchTerms.length === 0) {
    return [];
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
    category: entry.category,
    question: entry.question || undefined,
    answer: entry.answer,
    source: entry.source,
  }));
}

export async function getAllKnowledge(): Promise<KnowledgeEntry[]> {
  const results = await prisma.knowledgeBase.findMany({
    orderBy: {
      category: "asc",
    },
  });

  return results.map((entry) => ({
    category: entry.category,
    question: entry.question || undefined,
    answer: entry.answer,
    source: entry.source,
  }));
}

export async function parseExcelFile(fileBuffer: Buffer): Promise<KnowledgeEntry[]> {
  const workbook = XLSX.read(fileBuffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet) as any[];

  const entries: KnowledgeEntry[] = [];

  for (const row of data) {
    const category = row.Category || row.category || "General";
    const question = row.Question || row.question || null;
    const answer = row.Answer || row.answer || "";

    if (answer) {
      entries.push({
        category: String(category),
        question: question ? String(question) : undefined,
        answer: String(answer),
        source: "excel",
      });
    }
  }

  return entries;
}

export async function saveKnowledgeEntries(entries: KnowledgeEntry[]): Promise<void> {
  for (const entry of entries) {
    // Create a unique identifier for upsert
    const uniqueKey = `${entry.category}_${entry.question || ""}_${entry.answer.substring(0, 50)}`;
    
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
  }
}

export async function logAnalytics(question: string): Promise<void> {
  await prisma.analytics.upsert({
    where: {
      question: question,
    },
    update: {
      count: {
        increment: 1,
      },
      lastAsked: new Date(),
    },
    create: {
      question: question,
      count: 1,
      lastAsked: new Date(),
    },
  });
}

