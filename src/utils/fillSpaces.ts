interface LineItem {
  line: number;
  text: string;
  time: number;
}

function fillSpaces(arr: LineItem[]): LineItem[] {
  if (arr.length === 0) return arr;

  arr.sort((a, b) => a.line - b.line);
  const maxLine = Math.max(...arr.map((o) => o.line));

  const filled: LineItem[] = [];
  let currentLine = 1;

  for (const item of arr) {
    while (currentLine < item.line) {
      filled.push({
        line: currentLine,
        text: "\n",
        time: 0,
      });
      currentLine++;
    }

    filled.push({ ...item, line: currentLine });
    const newlines = (item.text.match(/\n/g) || []).length;
    currentLine = currentLine + (newlines || 1);
  }

  while (currentLine <= maxLine) {
    filled.push({
      line: currentLine,
      text: "\n",
      time: 0,
    });
    currentLine++;
  }

  return filled;
}

export default fillSpaces;
