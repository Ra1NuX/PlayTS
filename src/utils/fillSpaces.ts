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
    if(item?.text === "\r" || item.text === "") continue;
    while (currentLine < item.line && item.line != -1) {

      filled.push({
        line: currentLine,
        text: "\n",
        time: 0,
      });
      currentLine++;
    }

    if(!item.text.toString().match(/(["'`])(?:\\.|(?!\1)[^\\])*?\1/) && typeof item.text === 'string') {
      item.text = `'${item.text}'`;
    }

    filled.push({ ...item, text: item.text.toString(), line: currentLine });
    const newlines = (item.text.toString().match(/\n/g) || []).length;

    currentLine = currentLine + newlines+1
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
