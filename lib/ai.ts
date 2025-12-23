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
      console.log("Attempting Groq API call...");
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

      const content = response.data.choices?.[0]?.message?.content;
      if (content) {
        console.log("Groq API success");
        return content;
      }
      console.warn("Groq API returned empty response");
    } catch (error: any) {
      console.error("Groq API error:", error.response?.data || error.message);
      // Continue to fallback
    }
  } else {
    console.warn("GROQ_API_KEY not set, using fallback");
  }

  // Fallback response - provide intelligent response from knowledge base
  console.log("Using fallback response from knowledge base");
  
  if (context && context.length > 50 && !context.includes("No specific information found")) {
    // Extract relevant answer from context
    const contextLines = context.split('\n\n');
    
    // Try to find answer with "A:" or "Answer:"
    for (const line of contextLines) {
      if (line.includes('A:') || line.includes('Answer:')) {
        const answer = line.split('A:')[1]?.trim() || line.split('Answer:')[1]?.trim() || line;
        if (answer.length > 10) {
          return answer + "\n\nFor more information, please visit kenmarkitan.com or contact us directly.";
        }
      }
    }
    
    // Try to find line that matches the query
    const matchingLine = contextLines.find(line => 
      line.toLowerCase().includes(userQuery.toLowerCase().split(' ')[0])
    );
    if (matchingLine && matchingLine.length > 20) {
      return matchingLine + "\n\nFor more details, please visit kenmarkitan.com.";
    }
    
    // Return first meaningful answer from context
    const firstAnswer = contextLines.find(line => line.length > 20 && (line.includes(':') || line.includes('?')));
    if (firstAnswer) {
      const cleanAnswer = firstAnswer.split(':').slice(-1)[0]?.trim() || firstAnswer;
      return cleanAnswer + "\n\nFor more details, please visit kenmarkitan.com.";
    }
    
    // Return context as-is if it's meaningful
    if (context.length > 50) {
      return context.substring(0, 300) + "...\n\nFor more information, please visit kenmarkitan.com.";
    }
  }
  
  // Default helpful response
  return `Thank you for your question! I can help you with information about Kenmark ITan Solutions, including our services, company information, and FAQs. Please visit kenmarkitan.com for more details or contact us directly for specific inquiries.`;
}

