import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { v4 as uuid } from "uuid";

const schema = z.object({
  response: z.string(),
  code: z.string(),
  error: z.boolean(),
});

function extractResponseFromPartialJson(raw: string): string {
  const key = '"response":';
  const idx = raw.indexOf(key);
  if (idx === -1) return "";
  let rest = raw.slice(idx + key.length).trimStart();
  if (!rest.startsWith('"')) return "";
  rest = rest.slice(1);
  let out = "";
  let i = 0;
  while (i < rest.length) {
    if (rest[i] === "\\") {
      if (rest[i + 1] === "n") {
        out += "\n";
        i += 2;
      } else if (rest[i + 1] === '"') {
        out += '"';
        i += 2;
      } else if (rest[i + 1] === "\\") {
        out += "\\";
        i += 2;
      } else {
        out += rest[i];
        i += 1;
      }
    } else if (rest[i] === '"') {
      break;
    } else {
      out += rest[i];
      i += 1;
    }
  }
  return out;
}

function extractContentDeltaFromLine(line: string): string {
  const key = '"content":';
  const idx = line.indexOf(key);
  if (idx === -1) return "";
  let rest = line.slice(idx + key.length).trimStart();
  if (!rest.startsWith('"')) return "";
  rest = rest.slice(1);
  let out = "";
  let i = 0;
  while (i < rest.length) {
    if (rest[i] === "\\") {
      if (rest[i + 1] === "n") {
        out += "\n";
        i += 2;
      } else if (rest[i + 1] === '"') {
        out += '"';
        i += 2;
      } else if (rest[i + 1] === "\\") {
        out += "\\";
        i += 2;
      } else {
        out += rest[i];
        i += 1;
      }
    } else if (rest[i] === '"') {
      break;
    } else {
      out += rest[i];
      i += 1;
    }
  }
  return out;
}

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

  console.log("[callOpenAI] entry", { modelId, messagesCount: messages.length });

  do {
    try {
      console.log("[callOpenAI] fetch attempt", { retriesLeft: retries });
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

      console.log("[callOpenAI] response", { ok: response?.ok, status: response?.status, statusText: response?.statusText });

      if (!response?.ok) {
        const body = await response?.text().catch(() => "");
        console.warn("[callOpenAI] non-ok response body", body?.slice(0, 500));
        retries--;
        continue;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        console.error("[callOpenAI] no response.body.getReader()");
        onFinally({
          response: "",
          code: "",
          error: true,
          id: null,
        });
        return;
      }

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
          } catch {
            const delta = extractContentDeltaFromLine(jsonStr);
            if (delta) message += delta;
          }
          accumulatedResponse = extractResponseFromPartialJson(message);
          onData({ response: accumulatedResponse });
        }
      }

      console.log("[callOpenAI] stream done", { rawLength: message.length });

      const parsed = schema.safeParse(JSON.parse(message));

      if (!parsed.success) {
        console.warn("[callOpenAI] schema parse failed", parsed.error?.message ?? parsed.error);
        onFinally({
          response: "",
          code: "",
          error: true,
          id: null,
        });
        return;
      }

      const { response: finalResponse, code: finalCode, error } = parsed.data;

      console.log("[callOpenAI] success", { responseLength: finalResponse?.length, codeLength: finalCode?.length, error });
      onFinally({
        response: finalResponse,
        error,
        code: finalCode,
        id: uuid(),
      });
      return;
    } catch (err) {
      console.error("[callOpenAI] catch", err);
      onFinally({
        response: "",
        code: "",
        error: true,
        id: null,
      });
      return;
    }
  } while (retries >= 0);

  console.warn("[callOpenAI] exhausted retries");
  onFinally({
    response: "",
    code: "",
    error: true,
    id: null,
  });
}
