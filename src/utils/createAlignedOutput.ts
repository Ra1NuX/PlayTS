interface LineItem {
  line: number;
  text: string;
  time: number;
}

/**
 * Crea un array alineado donde cada elemento corresponde a una línea del código
 * Los outputs se colocan en la línea correspondiente del código ORIGINAL
 */
function createAlignedOutput(results: LineItem[], originalCode?: string): LineItem[] {
  try {
    if (results.length === 0) return [];

    const codeLines = originalCode ? originalCode.split('\n').length : 0;
    const outputLines = results.filter(result => result.line > 0).map(result => result.line);
    const maxOutputLine = outputLines.length > 0 ? Math.max(...outputLines) : 0;
    const maxLines = maxOutputLine > 0 ? maxOutputLine : Math.max(codeLines, 1);

    const lineMap = new Map<number, LineItem[]>();

    results.forEach(result => {
      if (result.line > 0) {
        if (!lineMap.has(result.line)) {
          lineMap.set(result.line, []);
        }
        lineMap.get(result.line)!.push(result);
      } else if (result.line === -1) {
        if (!lineMap.has(maxLines + 1)) {
          lineMap.set(maxLines + 1, []);
        }
        lineMap.get(maxLines + 1)!.push(result);
      }
    });

    const aligned: LineItem[] = [];

    for (let lineNum = 1; lineNum <= maxLines; lineNum++) {
      if (lineMap.has(lineNum)) {
        const outputs = lineMap.get(lineNum)!;
        outputs.forEach(output => {
          aligned.push({
            ...output,
            line: lineNum
          });
        });
      } else {
        aligned.push({
          line: lineNum,
          text: " ",
          time: 0
        });
      }
    }

    if (lineMap.has(maxLines + 1)) {
      const errors = lineMap.get(maxLines + 1)!;
      errors.forEach(error => {
        aligned.push({
          ...error,
          line: maxLines + 1
        });
      });
    }

    return aligned;

  } catch (error) {
    console.error('Error en createAlignedOutput:', error);
    return results;
  }
}

export default createAlignedOutput;
