import { dracula } from "react-syntax-highlighter/dist/esm/styles/hljs";

const darkTheme: { [key: string]: React.CSSProperties } = {
  ...dracula,
  // "hljs" suele ser la clase global. La usaremos para que de base el background sea transparente
  hljs: {
    ...dracula["hljs"],
    background: "transparent",
    color: "#50fa7b",
  },
  "hljs-number": {
    color: "#bd93f9",
  },
  "hljs-boolean": {
    color: "#ff79c6",
  },
  "hljs-literal": {
    color: "#ff79c6",
  },
  "hljs-comment": {
    color: "#6272A4",
    fontStyle: "italic",
  },
  "hljs-attr": {
    color: "#50fa7b",
  },
  "hljs-title": {
    color: "#50fa7b",
  },
  "hljs-name": {
    color: "#f1fa8c",
    fontWeight: "bold",
  },
  "hljs-type": {
    color: "#f1fa8c",
    fontWeight: "bold",
  },
};

const lightTheme: { [key: string]: React.CSSProperties } = {
  hljs: {
    ...dracula["hljs"],
    background: "transparent",
    color: "InfoText",
  },
  "hljs-number": {
    color: "#5E1675",
  },
  "hljs-string": {
    color: "#FF9D23",
    fontStyle: "semi-bold",
  },
  "hljs-boolean": {
    color: "#bd93f9",
  },
  "hljs-literal": {
    color: "#bd93f9",
  },
};

const monacoLightTheme = {
  base: "vs",
  inherit: true,
  rules: [
    { token: "comment", foreground: "6272A4", fontStyle: "italic" },
    { token: "keyword", foreground: "ff79c6" },
    { token: "string", foreground: "FF9D23", fontStyle: "semi-bold" },
    { token: "number", foreground: "5E1675" },
    { token: "type", foreground: "4EC9B0" },
    { token: "identifier", foreground: "3E7B27" },
    { token: "delimiter", foreground: "D4D4D4" },
    { token: "function", foreground: "BD93F9" },
    { token: "variable", foreground: "3E7B27" },
    { foreground: "50fa7b", token: "entity.name.function" },
  ],
  colors: {
    "editor.background": "#00000000",
    "editorCursor.foreground": "#6272A4",
    "editor.foreground": "#ABB2BF",
    "editorLineNumber.foreground": "#858585",
    "editorLineNumber.activeForeground": "#000000",
  },
};

const monacoDarkTheme = {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "comment", foreground: "6272A4", fontStyle: "italic" },
    { token: "keyword", foreground: "ff79c6" },
    { token: "string", foreground: "f1fa8c", fontStyle: "semi-bold" },
    { token: "number", foreground: "bd93f9" },
    { token: "type", foreground: "4EC9B0" },
    { token: "identifier", foreground: "50fa7b" },
    { token: "delimiter", foreground: "D4D4D4" },
  ],
  colors: {
    "editor.background": "#00000000",
    "editorCursor.foreground": "#FFFFFF",
    "editor.foreground": "#ABB2BF",
    "editorLineNumber.foreground": "#858585",
    "editorLineNumber.activeForeground": "#FFFFFF",
  },
};

export { darkTheme, lightTheme, monacoLightTheme, monacoDarkTheme };
