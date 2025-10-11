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

    // Calcular número máximo de líneas basado en el código ORIGINAL
    let maxLines = 50;
    if (originalCode) {
      maxLines = Math.max(originalCode.split('\n').length, 50);
    }

    // Crear un mapa de líneas para agrupar outputs por línea
    const lineMap = new Map<number, LineItem[]>();
    
    // Agrupar resultados por línea
    results.forEach(result => {
      if (result.line > 0) { // Ignorar errores (línea -1)
        if (!lineMap.has(result.line)) {
          lineMap.set(result.line, []);
        }
        lineMap.get(result.line)!.push(result);
      } else if (result.line === -1) {
        // Los errores van al final
        if (!lineMap.has(maxLines + 1)) {
          lineMap.set(maxLines + 1, []);
        }
        lineMap.get(maxLines + 1)!.push(result);
      }
    });

    // Crear array alineado
    const aligned: LineItem[] = [];
    
    for (let lineNum = 1; lineNum <= maxLines; lineNum++) {
      // Si hay outputs para esta línea, agregarlos
      if (lineMap.has(lineNum)) {
        const outputs = lineMap.get(lineNum)!;
        outputs.forEach(output => {
          aligned.push({
            ...output,
            line: lineNum
          });
        });
      } else {
        // Agregar línea vacía para mantener alineación
        aligned.push({
          line: lineNum,
          text: " ", // Un espacio para mantener la altura de línea
          time: 0
        });
      }
    }

    // Agregar errores al final si existen
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
