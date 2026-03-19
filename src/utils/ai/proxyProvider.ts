import { v4 as uuid } from "uuid";
import type { CallAIStreamCallbacks } from "./types";
import { parseStream } from "./streamParser";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

/**
 * Extract text delta from a proxy response chunk.
 * The proxy can relay any of the three provider formats.
 */
function extractProxyDelta(json: unknown): string {
  const obj = json as Record<string, unknown>;

  // OpenAI format
  const choices = obj.choices as Array<{ delta?: { content?: string } }> | undefined;
  const openaiDelta = choices?.[0]?.delta?.content;
  if (openaiDelta) return openaiDelta;

  // Anthropic format
  const delta = obj.delta as { text?: string } | undefined;
  if (delta?.text) return delta.text;

  // Gemini format
  const candidates = obj.candidates as Array<{
    content?: { parts?: Array<{ text?: string }> };
  }> | undefined;
  const geminiText = candidates?.[0]?.content?.parts?.[0]?.text;
  if (geminiText) return geminiText;

  return "";
}

export async function callAIProxy(
  provider: string,
  modelId: string,
  messages: { role: string; content: string }[],
  systemContent: string,
  callbacks: CallAIStreamCallbacks
): Promise<void> {
  const { onData, onFinally } = callbacks;
  const userId = (await import("../../stores/authStore")).useAuthStore.getState().userId;

  if (!userId || !API_URL) {
    onFinally({ response: "", error: true, id: null });
    return;
  }

  try {
    const res = await fetch(`${API_URL}/ai/chat?userId=${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider,
        model: modelId,
        messages,
        system: systemContent,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: res.statusText }));
      onFinally({
        response: errorData.error || `Proxy error: ${res.status}`,
        error: true,
        id: null,
      });
      return;
    }

    const fullText = await parseStream(
      res,
      extractProxyDelta,
      (accumulated) => onData({ response: accumulated }),
      "sse"
    );

    onFinally({ response: fullText, error: false, id: uuid() });
  } catch (err) {
    console.error("[callAIProxy] Fetch error:", err);
    onFinally({ response: "Failed to connect to AI proxy", error: true, id: null });
  }
}
