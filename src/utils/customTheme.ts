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
      color: '#B200B2', // Color morado para los números
    },
    'hljs-string': {
      color: '#007F00', // Color verde para las cadenas
    },
  };

export default customTheme;