import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

import { globalSettings } from "../hooks/useSettings";

import { v4 as uuid } from "uuid";
import { globalCode } from "../hooks/useCompiler";
import { t } from "i18next";

const schema = z.object({
  response: z.string(),
  code: z.string(),
  error: z.boolean(),
});

export async function callOpenAI(
  messages: { role: string; content: string }[],
  onData: (data: { response: string }) => void,
  onFinally: (data: {
    response: string;
    code: string;
    error: boolean;
    id: string | null;
  }) => void
) {

  const responseFormat = zodResponseFormat(schema, "correct");

  let retries = 3;
  let response;

  console.log({
    messages,
  });

  do {
    try {
      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${globalSettings.apiKey}`,
        },
        body: JSON.stringify({
          model: globalSettings.aiModel,
          messages: [
            {
              role: "system",
              content:
                t("SYSTEM_CONTEXT") + ' ' + 
                t("SYSTEM_MESSAGE_CONTEXT", {
                  code: globalCode,
                  name: globalSettings.name,
                  email: globalSettings.email,
                }),
            },
            ...messages,
          ],
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
            onData({
              response: accumulatedResponse,
            });
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content || "";
            message += delta;
            console.log({ message });
            if (message.replaceAll(" ", "").includes('"response":"')) {
              const match = message.match(
                /"response"\s*:\s*"((?:[^"\\]|\\.)*)/
              );
              if (match) {
                accumulatedResponse = match[1] || "";
              }
            }

            onData({
              response: accumulatedResponse,
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
          id: null,
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
        id: uuid(),
      });
      return;
    } catch (error) {
      console.error("Error:", error);
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
