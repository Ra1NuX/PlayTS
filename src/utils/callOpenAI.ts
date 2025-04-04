import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

import { context } from "../model/ai";

const schema = z.object({
  response: z.string(),
  code: z.string(),
  error: z.boolean(),
});

export async function callOpenAI(
  messages: { role: string; content: string }[],
  onData: (data: { response: string }) => void,
  onFinally: (data: { response: string; code: string; error: boolean }) => void
) {
  const apiKey = localStorage.getItem("apiKey");
  if (!apiKey) {
    throw new Error("API key is not set");
  }

  const responseFormat = zodResponseFormat(schema, "correct");

  let retries = 3;
  let response;
  do {
    try {
      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [{ role: "system", content: context }, ...messages],
          stream: true,
          response_format: responseFormat,
        }),
      });

      if (!response?.ok) {
        retries--;
        console.error("Error:", response.statusText);
        continue;
      }

      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder("utf-8");
      let accumulatedResponse = "";
      let codeBlock = "";
      let isCodeBlock = false;

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
            console.log("✅ Stream completo");
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content || "";

            message += delta;

            if (delta.includes("code")) {
              isCodeBlock = true;
              accumulatedResponse = accumulatedResponse.slice(0, -2);
            } else if (isCodeBlock) {
              codeBlock += delta;
            }

            if (!isCodeBlock) {
              accumulatedResponse += delta;
            }

            onData({
              response: accumulatedResponse.slice(13, -1),
            });
          } catch (err) {
            console.error("Error parseando JSON del chunk:", err);
          }
        }
      }

      const { success } = schema.safeParse(JSON.parse(message));

      if (!success) {
        console.error("Error parsing response:", message);
        onFinally({
          response: "",
          code: "",
          error: true,
        });
        return;
      }

      const {
        response: finalResponse,
        code: finalCode,
        error,
      } = schema.parse(JSON.parse(message));

      console.log({});

      onFinally({
        response: finalResponse,
        error,
        code: finalCode,
      });
      return;
    } catch (error) {
      console.error("Error:", error);
      onFinally({
        response: "",
        code: "",
        error: true,
      });
      return;
    }
  } while (retries >= 0);
}
