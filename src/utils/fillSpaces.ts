interface LineItem {
  line: number;
  text: string;
  time: number;
}

function fillSpaces(arr: LineItem[]): LineItem[] {
  try {

    if (arr.length === 0) return arr;

    arr.sort((a, b) => a.line - b.line);
    const maxLine = Math.max(...arr.map((o) => o.line));

    const filled: LineItem[] = [];
    let currentLine = 1;

    for (const item of arr) {

      const { text, line } = item;

      if (text === "\r" || text === "") continue;

      while (currentLine < line && line != -1) {
        filled.push({
          line: currentLine,
          text: "\n",
          time: 0,
        });
        currentLine++;
      }

      const itemTextStr = String(text);
      if (!itemTextStr.match(/(["'`])(?:\\.|(?!\1)[^\\])*?\1/)) {
        item.text = itemTextStr
      }

      filled.push({ ...item, text: String(item.text), line: currentLine });
      const newlines = String(item.text).match(/\n/g)?.length || 0;

      currentLine = currentLine + newlines + 1
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

  } catch (error) {
    console.log(error);
    return arr;
  }
}

export default fillSpaces;
