
const customTheme: {[key: string]: React.CSSProperties }= {
    // ...docco,
    // "hljs" suele ser la clase global. La usaremos para que de base el background sea transparente
    'hljs': {
      // ...docco['hljs'],
      background: 'transparent',
      color: 'InfoText'
    },
    'hljs-number': {
      color: '#bd93f9',
    },
    'hljs-string': {
      color: '#f1fa8c',
    },
    'hljs-boolean': {
      color: '#bd93f9'
    },
    "hljs-literal": {
      color: "#bd93f9",
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