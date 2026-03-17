import type { AIProviderConfig } from "./types";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";

export const geminiConfig: AIProviderConfig = {
  buildRequest: ({ modelId, apiKey, messages, systemContent }) => {
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? ("model" as const) : ("user" as const),
      parts: [{ text: m.content }],
    }));

    return {
      url: `${GEMINI_BASE}/models/${modelId}:streamGenerateContent?alt=json`,
      init: {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemContent }] },
          contents,
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 8192,
          },
        }),
      },
    };
  },
  extractDelta: (json: unknown) => {
    const obj = json as Record<string, unknown>;
    const candidates = obj.candidates as Array<{
      content?: { parts?: Array<{ text?: string }> };
    }> | undefined;
    return candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  },
};
