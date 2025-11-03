/**
 * API Route: /api/llm/chat
 * Proxies chat requests to OpenRouter (supports Qwen and other models)
 *
 * Request body:
 * {
 *   model: string,
 *   messages: { role: 'system'|'user'|'assistant', content: string }[],
 *   temperature?: number,
 *   max_tokens?: number
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { callOpenRouterChat } from "@/lib/openrouter-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { model, messages, temperature, max_tokens } = body || {};

    if (!model || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid payload. Expect { model, messages[] }" },
        { status: 400 }
      );
    }

    const data = await callOpenRouterChat({
      model,
      messages,
      temperature,
      max_tokens,
    });

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("/api/llm/chat error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to call OpenRouter" },
      { status: 500 }
    );
  }
}



