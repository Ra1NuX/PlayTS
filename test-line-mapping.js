// Test simple para verificar el mapeo de líneas
import { addInstructionsToCode } from './addInstructionsToCode';
import { createLineMapping } from './lineMapping';

const testCode = `// 0. Importamos lo que necesitemos
import fs from 'fs/promises';

// 1. Imprimir algo en la consola
console.log('¡Hola mundo desde tu editor personalizado!');

// 2. Definir una función sencilla
function sumar(a, b) {
  return a + b;
}

// 3. Llamar a la función y mostrar el resultado
const resultado = sumar(2, 3);
console.log('La suma de 2 y 3 es:', resultado);`;

console.log('🔍 Código original:');
console.log(testCode);

const instrumentedCode = addInstructionsToCode(testCode);
console.log('🔍 Código instrumentado:');
console.log(instrumentedCode);

const lineMapping = createLineMapping(testCode, instrumentedCode);
console.log('🔍 Mapeo de líneas:', lineMapping);

// Buscar líneas específicas en el código instrumentado
const instrumentedLines = instrumentedCode.split('\n');
instrumentedLines.forEach((line, index) => {
  if (line.includes('__report(')) {
    console.log(`🔍 Línea ${index + 1}: ${line}`);
  }
});
