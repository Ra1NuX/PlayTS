export default `
// 1. Imprimir algo en la consola
console.log('¡Hola mundo desde tu editor personalizado!');

// 2. Definir una función sencilla
function sumar(a, b) {
  return a + b;
}

// 3. Llamar a la función y mostrar el resultado
const resultado = sumar(2, 3);
console.log(\`La suma de 2 y 3 es: \${resultado}\`);

// 4. Usar un "top-level await" para fetch de datos
const resp = await fetch('https://pokeapi.co/api/v2/pokemon/1');
const data = await resp.json();

// 5. Mostrar parte de los datos obtenidos
console.log(\`Pokémon #1 es: \${data.name}\`);

// 6. Generar un pequeño array y mapearlo
const numeros = [1, 2, 3, 4, 5];
const alCuadrado = numeros.map(num => num * num);
console.log('Al cuadrado:', alCuadrado);
`

