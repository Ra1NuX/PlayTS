import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { v4 as uuid } from "uuid";

const schema = z.object({
  response: z.string(),
  code: z.string(),
  error: z.boolean(),
});

export interface CallAIStreamCallbacks {
  onData: (data: { response: string }) => void;
  onFinally: (data: {
    response: string;
    code: string;
    error: boolean;
    id: string | null;
  }) => void;
}

export async function callOpenAI(
  modelId: string,
  apiKey: string,
  messages: { role: string; content: string }[],
  systemContent: string,
  callbacks: CallAIStreamCallbacks
) {
  const { onData, onFinally } = callbacks;
  const responseFormat = zodResponseFormat(schema, "correct");

  let retries = 3;
  let response: Response | undefined;

  do {
    try {
      response = await fetch("https://api.openai.com/v1/chat/completions", {
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
          response_format: responseFormat,
        }),
      });

      if (!response?.ok) {
        retries--;
        continue;
      }

      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder("utf-8");
      let accumulatedResponse = "";
      let message = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk
          .split("\n")
          .filter((line) => line.trim().startsWith("data: "));

        for (const line of lines) {
          const jsonStr = line.replace(/^data: /, "").trim();
          if (jsonStr === "[DONE]") {
            onData({ response: accumulatedResponse });
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content || "";
            message += delta;
            if (message.replaceAll(" ", "").includes('"response":"')) {
              const match = message.match(
                /"response"\s*:\s*"((?:[^"\\]|\\.)*)/
              );
              if (match) {
                accumulatedResponse = match[1] || "";
              }
            }
            onData({ response: accumulatedResponse });
          } catch {
            continue;
          }
        }
      }

      const parsed = schema.safeParse(JSON.parse(message));

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
      return;
    } catch {
      onFinally({
        response: "",
        code: "",
        error: true,
        id: null,
      });
      return;
    }
  } while (retries >= 0);
}
