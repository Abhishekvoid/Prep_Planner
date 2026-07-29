import { NextRequest, NextResponse } from "next/server";
import { SENIOR_MENTOR_SYSTEM_PROMPT, buildUserPromptWithContext, MentorMode, TopicContext } from "@/lib/ai/prompt";

export const runtime = "nodejs";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      messages = [],
      mode = "grill",
      topicContext,
      apiKey: customApiKey,
      provider = "openai",
      model,
    }: {
      messages: ChatMessage[];
      mode: MentorMode;
      topicContext?: TopicContext;
      apiKey?: string;
      provider?: string;
      model?: string;
    } = body;

    // Resolve API key
    const envMentor = process.env.AI_MENTOR_API_KEY;
    const envOpenAI = process.env.OPENAI_API_KEY;
    const envGroq = process.env.GROQ_API_KEY;
    const envOpenRouter = process.env.OPENROUTER_API_KEY;
    const envGemini = process.env.GEMINI_API_KEY;

    const apiKey =
      customApiKey ||
      req.headers.get("x-api-key") ||
      envMentor ||
      envOpenAI ||
      envGroq ||
      envOpenRouter ||
      envGemini;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "NO_API_KEY",
          message:
            "No API key found. Please add OPENAI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY, or GEMINI_API_KEY to your .env.local file, or configure your key in the AI Mentor settings.",
        },
        { status: 401 }
      );
    }

    // Determine Endpoint and Target Model
    let endpoint = "https://api.openai.com/v1/chat/completions";
    let selectedModel = model || "gpt-4o-mini";

    if (customApiKey?.startsWith("AIza") || (envGemini && !customApiKey) || provider === "gemini") {
      endpoint = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
      selectedModel = model || "gemini-1.5-pro";
    } else if (customApiKey?.startsWith("gsk_") || (envGroq && !customApiKey) || provider === "groq") {
      endpoint = "https://api.groq.com/openai/v1/chat/completions";
      selectedModel = model || "llama-3.3-70b-versatile";
    } else if (customApiKey?.startsWith("sk-or-") || (envOpenRouter && !customApiKey) || provider === "openrouter") {
      endpoint = "https://openrouter.ai/api/v1/chat/completions";
      selectedModel = model || "meta-llama/llama-3.3-70b-instruct";
    }

    // Build complete message chain
    const formattedMessages: ChatMessage[] = [
      { role: "system", content: SENIOR_MENTOR_SYSTEM_PROMPT },
    ];

    // Append prior conversation
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (i === messages.length - 1 && msg.role === "user") {
        // Enrich latest message with topic context & mode instructions
        const enrichedContent = buildUserPromptWithContext(msg.content, mode, topicContext);
        formattedMessages.push({ role: "user", content: enrichedContent });
      } else {
        formattedMessages.push({ role: msg.role, content: msg.content });
      }
    }

    const payload = {
      model: selectedModel,
      messages: formattedMessages,
      temperature: 0.7,
      stream: true,
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...(provider === "openrouter" ? { "HTTP-Referer": "http://localhost:3000" } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: "AI_PROVIDER_ERROR", message: errorText },
        { status: response.status }
      );
    }

    // Return SSE stream directly to client
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: err.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
