import { useEffect } from "react";
import { Editor, EditorProps, useMonaco } from "@monaco-editor/react";

import useCompiler from "./hooks/useCompiler";
import fillMissingLines from "./utils/fillMissingLines";
import SyntaxHighlighter from "react-syntax-highlighter";
import customTheme from "./utils/customTheme";

const editorOptions: EditorProps["options"] = {
  minimap: { enabled: false }, // Elimina el minimapa
  fontFamily: "Fira Code, monospace", // Cambia el estilo de la fuente
  fontSize: 14, // Cambia el tamaño de la fuente
  theme: "custom-dark", // Tema personalizado
  lineNumbers: "off",
};

function App() {
  const { result, writting } = useCompiler();
  const monaco = useMonaco();

  useEffect(() => {
    if (!monaco) return;
    monaco.editor.defineTheme("custom-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", background: "282C34", foreground: "FFFFFF" }, // Fondo y texto
      ],
      colors: {
        "editor.background": "#0000",
        "editor.lineHighlightBackground": "#2C313A",
        "editorCursor.foreground": "#FFFFFF",
        "editor.foreground": "#ABB2BF",
        "editorLineNumber.foreground": "#858585", // Color de los números de línea
        "editorLineNumber.activeForeground": "#FFFFFF", // Color de los números de línea activos
      },
    });
    monaco.editor.setTheme("custom-dark");
  }, [monaco]);

  const filledArray = fillMissingLines(result || []);
  console.log({ filledArray });

  return (
    <main className="h-screen grid grid-cols-2 gap-2 p-2 bg-main-dark ">
      <div className="rounded-md shadow-xl overflow-hidden bg-main-light p-2 pl-0">
        <Editor
          loading={false}
          theme="custom-dark"
          defaultLanguage="typescript"
          onChange={(e) => {
            writting(e || "");
          }}
          options={editorOptions}
          className="font-mono leading-none bg-main-light w-full flex flex-1 focus-visible:outline-none resize-none"
        />
      </div>
      <aside className="text-blue-300 break-words overflow-y-auto font-semibold font-mono leading-none bg-main-light rounded-md shadow-xl w-full flex flex-col flex-1 p-2 px-4">
        {Array.isArray(filledArray)
          ? filledArray?.map((element) => {
              if (element) {
                const { text, time } = element;
                return (
                  <div className="flex w-full">

                    <div className="flex w-full justify-between font-mono leading-[19px]">
                      <SyntaxHighlighter language="javascript" PreTag={'pre'}
                      style={customTheme}
                      customStyle={{
                        padding: 0,
                        paddingLeft: "1.25rem",
                        backgroundColor: 'transparent',
                        fontPalette: 'dark',
                        color: '#fafafa'
                      }} className={`font-thin text-[#f1fa8c] ${text!=='\n' ?'border-l-4 border-gray-900/10 ' : ''} pl-5`}>{text}</SyntaxHighlighter>
                      {text !== "\n" && (
                        <span className="bg-slate-900/20 rounded-full px-1 text-xs text-gray-600 max-h-[19px] flex items-center justify-center">
                          {time} ms
                        </span>
                      )}
                    </div>
                  </div>
                );
              }
            })
          : JSON.stringify(filledArray)}
      </aside>
    </main>
  );
}

export default App;
