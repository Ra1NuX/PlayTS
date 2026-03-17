export interface UnclosedCodeBlock {
  markdownContent: string;
  language: string;
  codeContent: string;
}

export function parseUnclosedCodeFence(content: string): UnclosedCodeBlock | null {
  // Count all ``` occurrences at the start of a line (or start of string)
  const fenceRegex = /(?:^|\n)(```)/g;
  const fences: number[] = [];
  let match;

  while ((match = fenceRegex.exec(content)) !== null) {
    // Position of the ``` itself
    fences.push(match.index + (content[match.index] === '\n' ? 1 : 0));
  }

  // Also check if content starts with ```
  if (content.startsWith('```') && (fences.length === 0 || fences[0] !== 0)) {
    fences.unshift(0);
  }

  // Even number of fences = all closed
  if (fences.length % 2 === 0) return null;

  // Odd number = last fence is unclosed (opening without closing)
  const lastFencePos = fences[fences.length - 1];
  const afterFence = content.slice(lastFencePos + 3);

  const firstNewline = afterFence.indexOf("\n");
  const language =
    firstNewline === -1
      ? afterFence.trim()
      : afterFence.slice(0, firstNewline).trim();
  const codeContent =
    firstNewline === -1 ? "" : afterFence.slice(firstNewline + 1);
  const markdownContent = content.slice(0, lastFencePos);

  return { markdownContent, language, codeContent };
}
