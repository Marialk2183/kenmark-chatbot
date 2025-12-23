import axios from "axios";

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function generateAIResponse(
  userQuery: string,
  context: string,
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  const systemPrompt = `You are an AI assistant for Kenmark ITan Solutions.
Answer user queries using only the information available from kenmarkitan.com and the provided knowledge base.
Be polite, concise, and helpful. If you don't have the information, politely say "I don't have that information yet. Please contact us directly for more details."

Context from knowledge base:
${context}

User query: ${userQuery}`;

  try {
    // Try Ollama first (local LLM)
    const response = await axios.post(
      `${OLLAMA_API_URL}/api/chat`,
      {
        model: OLLAMA_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationHistory.slice(-6), // Last 6 messages for context
          { role: "user", content: userQuery },
        ],
        stream: false,
      },
      {
        timeout: 30000, // 30 second timeout
      }
    );

    return response.data.message?.content || "I apologize, but I couldn't generate a response. Please try again.";
  } catch (error: any) {
    // Fallback to alternative AI APIs if Ollama is not available
    if (error.code === "ECONNREFUSED" || error.response?.status === 404) {
      console.warn("Ollama not available, trying alternative APIs...");
      return await tryAlternativeAI(userQuery, context, conversationHistory);
    }
    
    console.error("AI generation error:", error);
    return "I apologize, but I'm experiencing technical difficulties. Please try again later.";
  }
}

async function tryAlternativeAI(
  userQuery: string,
  context: string,
  conversationHistory: ChatMessage[]
): Promise<string> {
  // Try Groq API (free tier available)
  if (process.env.GROQ_API_KEY) {
    try {
      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: `You are an AI assistant for Kenmark ITan Solutions. Answer using only the provided context. Context: ${context}`,
            },
            ...conversationHistory.slice(-6),
            { role: "user", content: userQuery },
          ],
          temperature: 0.7,
          max_tokens: 500,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      return response.data.choices[0]?.message?.content || "I couldn't generate a response.";
    } catch (error) {
      console.error("Groq API error:", error);
    }
  }

  // Fallback response
  return `Based on the available information: ${context.substring(0, 200)}... For more details, please visit kenmarkitan.com or contact us directly.`;
}

