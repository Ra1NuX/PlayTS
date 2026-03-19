/**
 * Unified SSE/JSON stream parser.
 *
 * @param response  - The fetch Response whose body will be streamed.
 * @param extractDelta - Provider-specific function that pulls the text delta
 *                       out of a parsed JSON chunk.
 * @param onChunk   - Called with the accumulated full text after every delta.
 * @param format    - 'sse' for Server-Sent Events (data: prefix lines),
 *                    'json' for newline-delimited JSON (Gemini style).
 * @returns The final accumulated text.
 */
export async function parseStream(
  response: Response,
  extractDelta: (json: unknown) => string,
  onChunk: (fullText: string) => void,
  format: "sse" | "json" = "sse"
): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No readable stream in response");
  }

  const decoder = new TextDecoder("utf-8");
  let fullText = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (format === "sse") {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data);
          const delta = extractDelta(parsed);
          if (delta) {
            fullText += delta;
            onChunk(fullText);
          }
        } catch {
          /* skip unparseable chunk */
        }
      } else {
        // json format: each non-empty line is a JSON object
        const trimmed = line.trim();
        if (!trimmed) continue;

        try {
          const parsed = JSON.parse(trimmed);
          const delta = extractDelta(parsed);
          if (delta) {
            fullText += delta;
            onChunk(fullText);
          }
        } catch {
          /* skip unparseable chunk */
          continue;
        }
      }
    }
  }

  return fullText;
}
