import { z } from "zod";
import { v4 as uuid } from "uuid";
import type { CallAIStreamCallbacks } from "./callOpenAI";

const schema = z.object({
  response: z.string(),
  code: z.string(),
  error: z.boolean(),
});

const ANTHROPIC_VERSION = "2023-06-01";

function mapToAnthropicMessages(messages: { role: string; content: string }[]): { role: "user" | "assistant"; content: string }[] {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
}

export async function callAnthropic(
  modelId: string,
  apiKey: string,
  messages: { role: string; content: string }[],
  systemContent: string,
  callbacks: CallAIStreamCallbacks
) {
  const { onData, onFinally } = callbacks;
  const anthropicMessages = mapToAnthropicMessages(messages);

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
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
    });

    if (!res.ok) {
      onFinally({
        response: "",
        code: "",
        error: true,
        id: null,
      });
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) {
      onFinally({
        response: "",
        code: "",
        error: true,
        id: null,
      });
      return;
    }

    const decoder = new TextDecoder("utf-8");
    let fullText = "";
    let accumulatedResponse = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter((line) => line.startsWith("data: "));

      for (const line of lines) {
        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const event = JSON.parse(jsonStr) as { type?: string; delta?: { text?: string }; content_block?: { text?: string } };
          const text = event.delta?.text ?? event.content_block?.text ?? "";
          if (text) {
            fullText += text;
            if (fullText.replaceAll(" ", "").includes('"response":"')) {
              const match = fullText.match(
                /"response"\s*:\s*"((?:[^"\\]|\\.)*)/
              );
              if (match) {
                accumulatedResponse = match[1] || "";
              }
            }
            onData({ response: accumulatedResponse });
          }
        } catch {
          continue;
        }
      }
    }

    const parsed = schema.safeParse(JSON.parse(fullText));

    if (!parsed.success) {
      onFinally({
        response: "",
        code: "",
        error: true,
        id: null,
      });
      return;
    }

    const { response: finalResponse, code: finalCode, error } = parsed.data;

    onFinally({
      response: finalResponse,
      error,
      code: finalCode,
      id: uuid(),
    });
  } catch {
    onFinally({
      response: "",
      code: "",
      error: true,
      id: null,
    });
  }
}
