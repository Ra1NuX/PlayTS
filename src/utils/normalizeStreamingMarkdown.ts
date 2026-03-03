export function normalizeStreamingMarkdown(content: string): string {
  if (!content.trim()) return content;
  let out = content;
  const starPairs = (out.match(/\*\*/g) || []).length;
  if (starPairs % 2 === 1) out += "**";
  return out;
}
