import type { AIProviderConfig } from "./types";

export const openaiConfig: AIProviderConfig = {
  buildRequest: ({ modelId, apiKey, messages, systemContent }) => ({
    url: "https://api.openai.com/v1/chat/completions",
    init: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: "system", content: systemContent },
          ...messages,
        ],
        stream: true,
      }),
    },
  }),
  extractDelta: (json: unknown) => {
    const obj = json as Record<string, unknown>;
    const choices = obj.choices as Array<{ delta?: { content?: string } }> | undefined;
    return choices?.[0]?.delta?.content || "";
  },
};
