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

    // Log analytics (non-blocking)
    try {
      await logAnalytics(message);
    } catch (analyticsError) {
      console.error("Analytics logging error (non-critical):", analyticsError);
    }

    // Search knowledge base for relevant context
    let knowledgeResults = [];
    try {
      knowledgeResults = await searchKnowledgeBase(message, 5);
    } catch (kbError) {
      console.error("Knowledge base search error (non-critical):", kbError);
      knowledgeResults = [];
    }
    
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
    let aiResponse: string;
    try {
      aiResponse = await generateAIResponse(
        message,
        contextText,
        conversationHistory
      );
      
      // Ensure we always have a valid response
      if (!aiResponse || aiResponse.trim().length === 0) {
        // Use knowledge base as fallback
        if (knowledgeResults.length > 0) {
          const firstResult = knowledgeResults[0];
          aiResponse = firstResult.answer || "Thank you for your question! Please visit kenmarkitan.com for more information.";
        } else {
          aiResponse = "Thank you for your question about Kenmark ITan Solutions! I can help you with information about our services, company details, and FAQs. Please visit kenmarkitan.com for more details or contact us directly.";
        }
      }
    } catch (aiError: any) {
      console.error("AI generation error:", aiError);
      // Use knowledge base as fallback
      if (knowledgeResults.length > 0) {
        aiResponse = knowledgeResults[0].answer || "Thank you for your question! Please visit kenmarkitan.com for more information.";
      } else {
        aiResponse = "Thank you for your question about Kenmark ITan Solutions! I can help you with information about our services, company details, and FAQs. Please visit kenmarkitan.com for more details or contact us directly.";
      }
    }

    // Save to database
    try {
      // Ensure session exists and get its ID
      const session = await prisma.chatSession.upsert({
        where: { sessionId },
        update: { updatedAt: new Date() },
        create: { sessionId },
      });

      // Save user message
      await prisma.chatMessage.create({
        data: {
          sessionId,
          sessionRef: session.id,
          role: "user",
          content: message,
        },
      });

      // Save assistant message
      await prisma.chatMessage.create({
        data: {
          sessionId,
          sessionRef: session.id,
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
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
    
    // Always return a valid response, never an error
    const fallbackResponse = "Thank you for your question about Kenmark ITan Solutions! I can help you with information about our services, company details, and FAQs. Please visit kenmarkitan.com for more details or contact us directly.";
    
    return NextResponse.json({
      response: fallbackResponse,
      context: "General assistance",
    });
  }
}

