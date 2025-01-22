import { useEffect } from "react";
import { Editor, EditorProps, useMonaco } from "@monaco-editor/react";

import useCompiler from "./hooks/useCompiler";
import fillMissingLines from "./utils/fillMissingLines";
import SyntaxHighlighter from "react-syntax-highlighter";
import customTheme from "./utils/customTheme";

const editorOptions: EditorProps["options"] = {
  minimap: { enabled: false }, // Elimina el minimapa
  fontFamily: "Fira Code, monospace", // Cambia el estilo de la fuente
  fontSize: 18, // Cambia el tamaño de la fuente
  theme: "custom-dark", // Tema personalizado
  lineNumbers: "off",
  renderLineHighlight: 'none',
  "semanticHighlighting.enabled": 'configuredByTheme',
  cursorBlinking: 'expand',
  lineHeight: 28
};

function App() {
  const { result, writting } = useCompiler();
  const monaco = useMonaco();

  useEffect(() => {
    if (!monaco) return;

    monaco.editor.defineTheme("custom-dark", {
      base: "vs-dark",
      inherit: true,      
      encodedTokensColors: [

      ],
      rules: [
        { token: "comment", foreground: "6A9955", fontStyle: "italic" },
        { token: "keyword", foreground: "ff79c6" },
        { token: "string", foreground: "f1fa8c" },
        { token: "number", foreground: "bd93f9" },
        { token: "type", foreground: "4EC9B0" },
        { token: "identifier", foreground: "50fa7b" },
        { token: "delimiter", foreground: "D4D4D4" },
      ],
      colors: {
        "editor.background": "#00000000",
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
    <main className="h-screen flex flex-col">
      <nav className="block w-full h-[30px] bg-main-dark z-10 drag">
        <div className="w-4/12 h-full leading-[30px] text-[#f7f7f7] float-left pl-[1em]"></div>
        <div className="float-right w-[150px] h-full leading-[30px] bg-main-dark no-drag">
          <div className="tileStyleButton hover:bg-[#333333aa]">
            <svg
              stroke="currentColor"
              fill="currentColor"
              stroke-width="0"
              viewBox="0 0 16 16"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M15 8H1V7h14v1z"></path>
            </svg>
          </div>
          <div className="tileStyleButton hover:bg-[#333333aa]">
            <svg
              stroke="currentColor"
              fill="currentColor"
              stroke-width="0"
              viewBox="0 0 16 16"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M3.5 4l.5-.5h8l.5.5v8l-.5.5H4l-.5-.5V4zm1 .5v7h7v-7h-7z"
              ></path>
            </svg>
          </div>
          <div className="tileStyleButton hover:bg-[#ff0000dd]">
            <span>&times;</span>
          </div>
        </div>
      </nav>
      <div className="grid grid-cols-2 p-2 pt-0 bg-main-dark h-full shadow-inner">
        <div className="rounded-md overflow-hidden bg-main-light p-2 pl-0 rounded-r-none border-r border-r-main-dark">
          <Editor
            loading={false}
            theme="custom-dark"
            defaultLanguage="typescript"
            language="typescript"
            
            onChange={(e) => {
              writting(e || "");
            }}
            options={editorOptions}
            className="font-mono leading-none w-full flex flex-1 focus-visible:outline-none resize-none"
          />
        </div>
        <aside className="text-blue-300 break-words overflow-y-auto font-semibold font-mono leading-none bg-main-light rounded-md rounded-l-none border-l border-l-main-dark w-full flex flex-col flex-1 p-2 px-4">
          {Array.isArray(filledArray)
            ? filledArray?.map((element) => {
                if (element) {
                  const { text, time } = element;
                  console.log({text})
                  return (
                    <div className="flex w-full">
                      <div className="flex w-full justify-between font-mono leading-5">
                        <SyntaxHighlighter
                          language="javascript"
                          // wrapLines
                          codeTagProps={{ style: { whiteSpace: "pre-wrap" } }}
                          PreTag={"pre"}
                          style={customTheme}
                          customStyle={{
                            fontSize: 18,
                            padding: 0,
                            paddingLeft: "1.25rem",
                            backgroundColor: "transparent",
                            fontPalette: "dark",
                            color: "#fafafa",
                          }}
                          className={`font-thin text-[#f1fa8c] ${
                            text !== "\n"
                              ? "border-l-4 border-gray-900/10 "
                              : ""
                          } pl-5`}
                        >
                          {/* {console.log({text})} */}
                          
                          {text}
                        </SyntaxHighlighter>
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
      </div>
    </main>
  );
}

export default App;
