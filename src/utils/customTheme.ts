import {
  dracula,
  atomOneLight,
} from "react-syntax-highlighter/dist/esm/styles/hljs";

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
  ...atomOneLight,
  hljs: {
    ...atomOneLight["hljs"],
    background: "transparent",
    color: "InfoText",
  },
  // "hljs-number": {
  //   color: "#5E1675",
  // },
  // "hljs-string": {
  //   color: "#FF9D23",
  //   fontStyle: "semi-bold",
  // },
  // "hljs-boolean": {
  //   color: "#bd93f9",
  // },
  // "hljs-literal": {
  //   color: "#bd93f9",
  // },
  // "hljs-attr": {
  //   color: "#50fa7b",
  // },
  // "hljs-title": {
  //   color: "#50fa7b",
  // },
};

const monacoLightTheme = {
  base: "vs",
  inherit: true,
  rules: 
    [
      { token: "comment",          foreground: "#8591B0", fontStyle: "italic" },
      { token: "keyword",          foreground: "#D10074" },
      { token: "string",           foreground: "#BCAA23", fontStyle: "semi-bold" },
      { token: "number",           foreground: "#6E56CF" },
      { token: "type",             foreground: "#32A290" },
      { token: "boolean",          foreground: "#D10074" },
      { token: "identifier",       foreground: "#178738" },
      { token: "delimiter",        foreground: "#9A9A9A" },
      { token: "function",         foreground: "#6E56CF" },
      { token: "variable",         foreground: "#178738" },
      { token: "parameter",        foreground: "#DD7B50" },
      { token: "class",            foreground: "#DD7B50" },
      { token: "class.identifier", foreground: "#178738" }
  ],
  colors: {
    "editor.background": "#00000000",
    "editorCursor.foreground": "#6272A4",
    "editor.foreground": "#ABB2BF",
    "editorLineNumber.foreground": "#858585",
    "editorLineNumber.activeForeground": "#000000",
    'editorBracketHighlight.foreground1': '#000000',
    'editorBracketHighlight.foreground2': '#000000',
    'editorBracketHighlight.foreground3': '#000000',
    'editorBracketHighlight.foreground4': '#000000',
    'editorBracketHighlight.foreground5': '#000000',
    'editorBracketHighlight.foreground6': '#000000',
  },
};

const monacoDarkTheme = {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "comment", foreground: "#6272A4", fontStyle: "italic" },
    { token: "keyword", foreground: "#ff79c6" },
    { token: "string", foreground: "#f1fa8c", fontStyle: "semi-bold" },
    { token: "number", foreground: "#bd93f9" },
    { token: "type", foreground: "#4EC9B0" },
    { token: "boolean", foreground: "#ff79c6" },
    { token: "identifier", foreground: "#50fa7b" },
    { token: "delimiter", foreground: "#ff79c6" },
    { token: "function", foreground: "#BD93F9" },
    { token: "variable", foreground: "#50fa7b" },
    { token: "parameter", foreground: "#ffb86c" },
    { token: "class", foreground: "#ffb86c" },
    { token: "class.identifier", foreground: "#50fa7b" },
    { token: "type", foreground: "#8be9fd" }
  ],
  colors: {
    "editor.background": "#00000000",
    "editorCursor.foreground": "#FFFFFF",
    "editor.foreground": "#ABB2BF",
    "editorLineNumber.foreground": "#858585",
    "editorLineNumber.activeForeground": "#FFFFFF",
    'editorBracketHighlight.foreground1': '#FFFFFF',
    'editorBracketHighlight.foreground2': '#FFFFFF',
    'editorBracketHighlight.foreground3': '#FFFFFF',
    'editorBracketHighlight.foreground4': '#FFFFFF',
    'editorBracketHighlight.foreground5': '#FFFFFF',
    'editorBracketHighlight.foreground6': '#FFFFFF',
  },
};

export { darkTheme, lightTheme, monacoLightTheme, monacoDarkTheme };
