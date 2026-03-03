export interface UnclosedCodeBlock {
  markdownContent: string;
  language: string;
  codeContent: string;
}

export function parseUnclosedCodeFence(content: string): UnclosedCodeBlock | null {
  const lastFence = content.lastIndexOf("```");
  if (lastFence === -1) return null;
  const afterFence = content.slice(lastFence + 3);
  const hasClosing = afterFence.includes("\n```");
  if (hasClosing) return null;
  const firstNewline = afterFence.indexOf("\n");
  const language =
    firstNewline === -1
      ? afterFence.trim()
      : afterFence.slice(0, firstNewline).trim();
  const codeContent =
    firstNewline === -1 ? "" : afterFence.slice(firstNewline + 1);
  const markdownContent = content.slice(0, lastFence);
  return { markdownContent, language, codeContent };
}
