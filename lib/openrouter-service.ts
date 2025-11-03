/**
 * OpenRouter Service
 * Unified helper to call OpenRouter models (e.g., Qwen) from server code
 *
 * Notes:
 * - Reads API key from process.env.OPENROUTER_API_KEY
 * - Optionally forwards site metadata headers per OpenRouter best practices
 * - Keeps response shape simple and typed for our app use
 */

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type OpenRouterChatRequest = {
  model: string; // e.g. "qwen/qwq-32b:free" or any other OpenRouter model
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
};

type OpenRouterChoice = {
  index: number;
  message: ChatMessage;
};

type OpenRouterChatResponse = {
  id: string;
  choices: OpenRouterChoice[];
};

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * callOpenRouterChat
 * Minimal wrapper for OpenRouter chat completions
 */
export async function callOpenRouterChat(
  req: OpenRouterChatRequest
): Promise<OpenRouterChatResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY in environment");
  }

  // Optional best-practice headers for OpenRouter routing/analytics
  const siteUrl = process.env.OPENROUTER_SITE_URL; // e.g. https://example.com
  const siteName = process.env.OPENROUTER_SITE_NAME || "Aster Royale: The AI Arena";

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  if (siteUrl) headers["HTTP-Referer"] = siteUrl;
  if (siteName) headers["X-Title"] = siteName;

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: req.model,
      messages: req.messages,
      temperature: req.temperature ?? 0.7,
      max_tokens: req.max_tokens ?? 1024,
    }),
    // Server-only call; no caching to keep it live
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`OpenRouter error ${response.status}: ${text}`);
  }

  const data = (await response.json()) as OpenRouterChatResponse;
  return data;
}

/**
 * Convenience helper for Qwen free model
 */
export async function callQwenFree(
  messages: ChatMessage[],
  options?: { temperature?: number; maxTokens?: number }
) {
  return callOpenRouterChat({
    model: "qwen/qwq-32b:free",
    messages,
    temperature: options?.temperature,
    max_tokens: options?.maxTokens,
  });
}



