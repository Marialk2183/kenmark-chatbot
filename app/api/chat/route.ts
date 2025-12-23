import { NextRequest, NextResponse } from "next/server";
import { generateAIResponse, ChatMessage } from "@/lib/ai";
import { searchKnowledgeBase, logAnalytics } from "@/lib/knowledge";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, history } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Log analytics
    await logAnalytics(message);

    // Search knowledge base for relevant context
    const knowledgeResults = await searchKnowledgeBase(message, 5);
    
    // Build context from knowledge base
    const context = knowledgeResults
      .map((kb) => {
        if (kb.question) {
          return `Q: ${kb.question}\nA: ${kb.answer}`;
        }
        return `${kb.category}: ${kb.answer}`;
      })
      .join("\n\n");

    // If no context found, use default message
    const contextText = context || "No specific information found in knowledge base. Please provide general assistance.";

    // Convert history to ChatMessage format
    const conversationHistory: ChatMessage[] = (history || []).map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Generate AI response using RAG
    const aiResponse = await generateAIResponse(
      message,
      contextText,
      conversationHistory
    );

    // Save to database
    try {
      // Ensure session exists
      await prisma.chatSession.upsert({
        where: { sessionId },
        update: { updatedAt: new Date() },
        create: { sessionId },
      });

      // Save user message
      await prisma.chatMessage.create({
        data: {
          sessionId,
          role: "user",
          content: message,
        },
      });

      // Save assistant message
      await prisma.chatMessage.create({
        data: {
          sessionId,
          role: "assistant",
          content: aiResponse,
        },
      });
    } catch (dbError) {
      console.error("Database error (non-critical):", dbError);
      // Continue even if DB fails
    }

    return NextResponse.json({
      response: aiResponse,
      context: knowledgeResults.length > 0 ? "Found relevant information" : "No specific information found",
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

