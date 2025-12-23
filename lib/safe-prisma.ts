import { PrismaClient } from "@prisma/client";

// Safe Prisma wrapper that never throws
let prismaClient: PrismaClient | null = null;

export function getPrisma() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (!prismaClient) {
    try {
      prismaClient = new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["error"] : [],
      });
    } catch (error) {
      console.error("Failed to create Prisma client:", error);
      return null;
    }
  }

  return prismaClient;
}

// Safe database operations that never throw
export async function safeDbOperation<T>(
  operation: (prisma: PrismaClient) => Promise<T>,
  fallback: T
): Promise<T> {
  const prisma = getPrisma();
  if (!prisma) {
    return fallback;
  }

  try {
    return await operation(prisma);
  } catch (error) {
    console.error("Database operation error:", error);
    return fallback;
  }
}

