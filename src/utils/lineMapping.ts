import * as acorn from "acorn";

/**
 * Genera un mapa de líneas del código original a las líneas del código instrumentado
 */
export function createLineMapping(originalCode: string, instrumentedCode: string): Map<number, number> {
  const lineMap = new Map<number, number>();
  
  try {
    // Parsear el código original para encontrar las líneas de console.log
    const ast = acorn.parse(originalCode, {
      ecmaVersion: 2025,
      sourceType: "module",
      allowAwaitOutsideFunction: true,
    });

    const originalLines = originalCode.split('\n');
    const instrumentedLines = instrumentedCode.split('\n');

    ast.body.forEach((node) => {
      if (node.type === 'ExpressionStatement') {
        if (node.expression.type === 'CallExpression') {
          if (node.expression.callee.object.name === 'console' && node.expression.callee.property.name === 'log') {
            const lineMatch = node.expression.arguments[1].value;
            const instrumentedLineNum = index + 1;
            lineMap.set(lineMatch, instrumentedLineNum);
          }
        }
      }
    });

    return lineMap;
  } catch (error) {
    console.error('Error creando mapeo de líneas:', error);
    return new Map();
  }
}

/**
 * Corrige los números de línea en los resultados basándose en el mapeo
 */
export function correctLineNumbers(results: any[], lineMapping: Map<number, number>): any[] {
  return results.map(result => {
    if (result.line > 0 && lineMapping.has(result.line)) {
      return {
        ...result,
        line: lineMapping.get(result.line)!
      };
    }
    return result;
  });
}
