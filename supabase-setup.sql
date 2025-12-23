-- Create ChatSession table
CREATE TABLE IF NOT EXISTS "ChatSession" (
    "id" SERIAL PRIMARY KEY,
    "sessionId" TEXT UNIQUE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create ChatMessage table
CREATE TABLE IF NOT EXISTS "ChatMessage" (
    "id" SERIAL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "sessionRef" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatMessage_sessionRef_fkey" FOREIGN KEY ("sessionRef") REFERENCES "ChatSession"("id") ON DELETE CASCADE
);

-- Create indexes for ChatMessage
CREATE INDEX IF NOT EXISTS "ChatMessage_sessionId_idx" ON "ChatMessage"("sessionId");
CREATE INDEX IF NOT EXISTS "ChatMessage_sessionRef_idx" ON "ChatMessage"("sessionRef");

-- Create KnowledgeBase table
CREATE TABLE IF NOT EXISTS "KnowledgeBase" (
    "id" SERIAL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "question" TEXT,
    "answer" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for KnowledgeBase
CREATE INDEX IF NOT EXISTS "KnowledgeBase_category_idx" ON "KnowledgeBase"("category");
CREATE INDEX IF NOT EXISTS "KnowledgeBase_question_idx" ON "KnowledgeBase"("question");
CREATE INDEX IF NOT EXISTS "KnowledgeBase_category_question_idx" ON "KnowledgeBase"("category", "question");

-- Create Analytics table
CREATE TABLE IF NOT EXISTS "Analytics" (
    "id" SERIAL PRIMARY KEY,
    "question" TEXT NOT NULL UNIQUE,
    "count" INTEGER NOT NULL DEFAULT 1,
    "lastAsked" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for Analytics
CREATE INDEX IF NOT EXISTS "Analytics_count_idx" ON "Analytics"("count");

-- Drop existing tables if they exist (to start fresh)
DROP TABLE IF EXISTS "ChatMessage" CASCADE;
DROP TABLE IF EXISTS "ChatSession" CASCADE;
DROP TABLE IF EXISTS "KnowledgeBase" CASCADE;
DROP TABLE IF EXISTS "Analytics" CASCADE;

-- Recreate ChatSession table
CREATE TABLE "ChatSession" (
    "id" SERIAL PRIMARY KEY,
    "sessionId" TEXT UNIQUE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Recreate ChatMessage table
CREATE TABLE "ChatMessage" (
    "id" SERIAL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "sessionRef" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatMessage_sessionRef_fkey" FOREIGN KEY ("sessionRef") REFERENCES "ChatSession"("id") ON DELETE CASCADE
);

-- Create indexes for ChatMessage
CREATE INDEX "ChatMessage_sessionId_idx" ON "ChatMessage"("sessionId");
CREATE INDEX "ChatMessage_sessionRef_idx" ON "ChatMessage"("sessionRef");

-- Recreate KnowledgeBase table
CREATE TABLE "KnowledgeBase" (
    "id" SERIAL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "question" TEXT,
    "answer" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for KnowledgeBase
CREATE INDEX "KnowledgeBase_category_idx" ON "KnowledgeBase"("category");
CREATE INDEX "KnowledgeBase_question_idx" ON "KnowledgeBase"("question");
CREATE INDEX "KnowledgeBase_category_question_idx" ON "KnowledgeBase"("category", "question");

-- Recreate Analytics table
CREATE TABLE "Analytics" (
    "id" SERIAL PRIMARY KEY,
    "question" TEXT NOT NULL UNIQUE,
    "count" INTEGER NOT NULL DEFAULT 1,
    "lastAsked" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for Analytics
CREATE INDEX "Analytics_count_idx" ON "Analytics"("count");

-- Insert initial knowledge base data
INSERT INTO "KnowledgeBase" ("category", "question", "answer", "source", "createdAt", "updatedAt") VALUES
('About', 'What is Kenmark ITan Solutions?', 'Kenmark ITan Solutions is a leading technology company specializing in innovative IT solutions, AI integration, and digital transformation services. We help businesses leverage cutting-edge technology to achieve their goals.', 'website', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Services', 'What services are offered?', 'We offer a wide range of services including: IT consulting, AI solutions development, digital transformation, cloud services, software development, and technology training programs.', 'website', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Contact', 'How can I contact the company?', 'You can contact us through our website at kenmarkitan.com, visit our contact page, or reach out via email for inquiries.', 'website', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

