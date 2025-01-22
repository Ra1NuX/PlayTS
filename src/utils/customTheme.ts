import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";

const customTheme = {
    ...docco,
    // "hljs" suele ser la clase global. La usaremos para que de base el background sea transparente
    'hljs': {
      ...docco['hljs'],
      background: 'transparent',
      // Si quieres un color base para el texto, puedes usar lo que gustes, 
      // aunque 'InfoText' no es un color estándar en la web (es una variable de sistema en Windows). 
      // Aun así, lo dejamos aquí como ejemplo.
      color: 'InfoText'
    },
    'hljs-number': {
      color: '#bd93f9', // Color morado para los números
    },
    'hljs-string': {
      color: '#f1fa8c', // Color verde para las cadenas
    },
  };

export default customTheme;

// { token: "comment", foreground: "6A9955", fontStyle: "italic" },
// { token: "keyword", foreground: "ff79c6" },
// { token: "string", foreground: "f1fa8c" },
// { token: "number", foreground: "bd93f9" },
// { token: "type", foreground: "4EC9B0" },
// { token: "identifier", foreground: "50fa7b" },
// { token: "delimiter", foreground: "D4D4D4" },