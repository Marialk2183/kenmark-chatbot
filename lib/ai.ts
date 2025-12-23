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

  // Skip Ollama in production (it won't be available)
  if (process.env.NODE_ENV === "production" || !OLLAMA_API_URL.includes("localhost")) {
    console.log("Skipping Ollama, using alternative AI or fallback");
    return await tryAlternativeAI(userQuery, context, conversationHistory);
  }

  try {
    // Try Ollama first (local LLM) - only in development
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
        timeout: 5000, // Short timeout for faster fallback
      }
    );

    const content = response.data.message?.content;
    if (content && content.trim().length > 0) {
      return content;
    }
  } catch (error: any) {
    console.warn("Ollama not available, using alternative AI or fallback");
  }
  
  // Always fallback to alternative AI or knowledge base
  return await tryAlternativeAI(userQuery, context, conversationHistory);
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
  console.log("Context length:", context?.length || 0);
  
  if (context && context.length > 20 && !context.includes("No specific information found")) {
    // Extract relevant answer from context
    const contextLines = context.split('\n\n').filter(line => line.trim().length > 0);
    
    // Try to find answer with "A:" or "Answer:"
    for (const line of contextLines) {
      if (line.includes('A:') || line.includes('Answer:')) {
        const parts = line.split('A:');
        const answer = parts.length > 1 ? parts[1].trim() : line.split('Answer:')[1]?.trim() || line;
        if (answer && answer.length > 10) {
          return answer + "\n\nFor more information, please visit kenmarkitan.com or contact us directly.";
        }
      }
    }
    
    // Try to find line that matches the query keywords
    const queryWords = userQuery.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    for (const word of queryWords) {
      const matchingLine = contextLines.find(line => 
        line.toLowerCase().includes(word)
      );
      if (matchingLine && matchingLine.length > 20) {
        // Extract the answer part
        const answerPart = matchingLine.includes(':') 
          ? matchingLine.split(':').slice(-1)[0].trim()
          : matchingLine;
        if (answerPart.length > 10) {
          return answerPart + "\n\nFor more details, please visit kenmarkitan.com.";
        }
      }
    }
    
    // Return first meaningful answer from context
    for (const line of contextLines) {
      if (line.length > 30) {
        // Extract answer if it has a colon separator
        const answerPart = line.includes(':') 
          ? line.split(':').slice(-1)[0].trim()
          : line.trim();
        if (answerPart.length > 20) {
          return answerPart + "\n\nFor more details, please visit kenmarkitan.com.";
        }
      }
    }
    
    // Return first substantial line from context
    const firstSubstantial = contextLines.find(line => line.length > 50);
    if (firstSubstantial) {
      return firstSubstantial.substring(0, 400) + (firstSubstantial.length > 400 ? "..." : "") + "\n\nFor more information, please visit kenmarkitan.com.";
    }
  }
  
  // Default helpful response - always return something useful
  return `Thank you for your question about Kenmark ITan Solutions! 

I can help you with information about:
• Our services and solutions
• Company information
• Frequently asked questions
• Contact information

Please visit kenmarkitan.com for more details, or feel free to ask me a specific question and I'll do my best to help!`;
}

