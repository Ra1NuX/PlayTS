import { z } from "zod";
import { v4 as uuid } from "uuid";
import type { CallAIStreamCallbacks } from "./callOpenAI";

const schema = z.object({
  response: z.string(),
  code: z.string(),
  error: z.boolean(),
});

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";

function mapRole(role: string): "user" | "model" {
  return role === "assistant" ? "model" : "user";
}

export async function callGemini(
  modelId: string,
  apiKey: string,
  messages: { role: string; content: string }[],
  systemContent: string,
  callbacks: CallAIStreamCallbacks
) {
  const { onData, onFinally } = callbacks;

  const contents = messages.map((m) => ({
    role: mapRole(m.role),
    parts: [{ text: m.content }],
  }));

  try {
    const url = `${GEMINI_BASE}/models/${modelId}:streamGenerateContent?alt=json`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemContent }],
        },
        contents,
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      onFinally({
        response: "",
        code: "",
        error: true,
        id: null,
      });
      return;
    }

    const reader = response.body?.getReader();
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
      const lines = chunk.split("\n").filter((line) => line.trim());

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          const text =
            parsed.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
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
