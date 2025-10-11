/**
 * Devuelve un mapeo de línea original -> líneas instrumentadas donde se reporta esa línea.
 * Ej.: original 12 -> [34, 35] (si hay varios __report para la misma original)
 */
export function createLineMapping(
    originalCode: string,
    instrumentedCode: string
  ): Map<number, number[]> {
    const lineMap = new Map<number, number[]>();
  
    const instrumentedLines = instrumentedCode.split("\n");
  
    // Buscamos __report(__result, <line>, ...) tolerando espacios y saltos
    // Captura el segundo argumento numérico como línea original.
    const reportLineRegex = /__report\s*\(\s*[^,]+,\s*(\d+)\s*,/;
  
    instrumentedLines.forEach((line, index) => {
      const m = line.match(reportLineRegex);
      if (!m) return;
      const originalLineNum = Number(m[1]);
      if (Number.isNaN(originalLineNum)) return;
  
      const instrumentedLineNum = index + 1; // 1-based
      const arr = lineMap.get(originalLineNum);
      if (arr) arr.push(instrumentedLineNum);
      else lineMap.set(originalLineNum, [instrumentedLineNum]);
    });
  
    return lineMap;
  }
  
  /**
   * Corrige números de línea apoyándose en el mapeo.
   * Estrategia:
   *  - Si hay match exacto, usamos la primera línea instrumentada registrada.
   *  - Si no, buscamos la línea original previa más cercana que tenga mapeo.
   */
  export function correctLineNumbers<T extends { line?: number }>(
    results: T[],
    lineMapping: Map<number, number[]>
  ): T[] {
    if (!results?.length) return results;
  
    // Precalculamos las claves ordenadas para búsqueda por “previa más cercana”
    const sortedOriginals = Array.from(lineMapping.keys()).sort((a, b) => a - b);
  
    const pickFirst = (arr?: number[]) => (arr && arr.length ? arr[0] : undefined);
  
    const findNearestPrev = (line: number) => {
      // binary search de la mayor clave <= line
      let lo = 0, hi = sortedOriginals.length - 1, ans = -1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (sortedOriginals[mid] <= line) {
          ans = mid;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }
      if (ans === -1) return undefined;
      return pickFirst(lineMapping.get(sortedOriginals[ans]));
    };
  
    return results.map(r => {
      const ln = r.line ?? 0;
      if (ln <= 0) return r;
  
      const exact = pickFirst(lineMapping.get(ln));
      const mapped = exact ?? findNearestPrev(ln);
  
      return mapped ? { ...r, line: mapped } : r;
    });
  }