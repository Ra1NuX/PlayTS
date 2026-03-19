import { v4 as uuid } from "uuid";
import type { AIProviderConfig, AIRequestParams, CallAIStreamCallbacks } from "./types";
import { parseStream } from "./streamParser";

/**
 * Generic AI provider caller.  Builds the request from the provider config,
 * fetches with optional retries, streams the response, and invokes callbacks.
 */
export async function callAIProvider(
  config: AIProviderConfig,
  params: AIRequestParams,
  callbacks: CallAIStreamCallbacks,
  options?: { retries?: number; format?: "sse" | "json" }
): Promise<void> {
  const { onData, onFinally } = callbacks;
  const maxRetries = options?.retries ?? 3;
  const format = options?.format ?? "sse";

  let retries = maxRetries;

  do {
    try {
      const { url, init } = config.buildRequest(params);
      const response = await fetch(url, init);

      if (!response.ok) {
        retries--;
        continue;
      }

      const fullText = await parseStream(
        response,
        config.extractDelta,
        (accumulated) => onData({ response: accumulated }),
        format
      );

      onFinally({ response: fullText, error: false, id: uuid() });
      return;
    } catch (err) {
      console.error("[callAIProvider] error:", err);
      onFinally({ response: "", error: true, id: null });
      return;
    }
  } while (retries >= 0);

  onFinally({ response: "", error: true, id: null });
}
