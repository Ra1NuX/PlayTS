import type { AIProviderConfig } from "./types";

const ANTHROPIC_VERSION = "2023-06-01";

export const anthropicConfig: AIProviderConfig = {
  buildRequest: ({ modelId, apiKey, messages, systemContent }) => {
    const anthropicMessages = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    return {
      url: "https://api.anthropic.com/v1/messages",
      init: {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": ANTHROPIC_VERSION,
        },
        body: JSON.stringify({
          model: modelId,
          max_tokens: 8192,
          system: systemContent,
          messages: anthropicMessages,
          stream: true,
        }),
      },
    };
  },
  extractDelta: (json: unknown) => {
    const obj = json as Record<string, unknown>;
    const delta = obj.delta as { text?: string } | undefined;
    const contentBlock = obj.content_block as { text?: string } | undefined;
    return delta?.text ?? contentBlock?.text ?? "";
  },
};
