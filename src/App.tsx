import { useEffect } from "react";
import { Editor, EditorProps, useMonaco } from "@monaco-editor/react";

import useCompiler from "./hooks/useCompiler";
import fillMissingLines from "./utils/fillMissingLines";
import SyntaxHighlighter from "react-syntax-highlighter";
import customTheme from "./utils/customTheme";
import Header from "./components/Header";
import DraggableDivider from "./components/DraggableDivider";
import defaultText from "./utils/defaultText";

const editorOptions: EditorProps["options"] = {
  minimap: { enabled: false }, // Elimina el minimapa
  fontFamily: "Fira Code, monospace", // Cambia el estilo de la fuente
  fontSize: 18, // Cambia el tamaño de la fuente
  theme: "custom-dark", // Tema personalizado
  lineNumbers: "off",
  renderLineHighlight: "none",
  "semanticHighlighting.enabled": "configuredByTheme",
  cursorBlinking: "expand",
  lineHeight: 28,
  glyphMargin: false,
  wordWrap: 'on',
  scrollBeyondLastLine: false,
  scrollbar: {
    vertical: 'auto',
    useShadows: false
  }
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
        { token: "comment", foreground: "6272A4", fontStyle: "italic" },
        { token: "keyword", foreground: "ff79c6"},
        { token: "string", foreground: "f1fa8c", fontStyle: 'semi-bold' },
        { token: "number", foreground: "bd93f9" },
        { token: "type", foreground: "4EC9B0" },
        { token: "identifier", foreground: "50fa7b" },
        { token: "delimiter", foreground: "D4D4D4" },
        { token: 'function', foreground: 'BD93F9'},
      ],
      colors: {
        "editor.background": "#00000000",
        "editorCursor.foreground": "#FFFFFF",
        "editor.foreground": "#ABB2BF",
        "editorLineNumber.foreground": "#858585", 
        "editorLineNumber.activeForeground": "#FFFFFF", 
      },
    });
    monaco.editor.setTheme("custom-dark");
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.Latest,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      allowJs: true,
    })
  }, [monaco]);

  const filledArray = fillMissingLines(result || []);

  return (
    <main className="h-screen flex flex-col">
      <Header />
      <DraggableDivider
        leftComponent={
          <Editor
            loading={false}
            theme="custom-dark"
            defaultLanguage="typescript"
            language="typescript"
            defaultValue={defaultText}
            onChange={(e) => {
              writting(e || "");
            }}
            options={editorOptions}
            className="font-mono leading-none w-full flex flex-1 focus-visible:outline-none resize-none"
          />
        }
        rightComponent={
          <>
            {Array.isArray(filledArray)
              ? filledArray?.map((element) => {
                  if (element) {
                    const { text, time } = element;
                    console.log({ text });
                    return (
                      <div className="flex w-full">
                        <div className="flex w-full justify-between font-mono leading-5">
                          <SyntaxHighlighter
                            language="javascript"
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
                              lineHeight: "28px",
                            }}
                            className={`font-thin text-[#f1fa8c] ${
                              text !== "\n"
                                ? "border-l-4 border-gray-900/10 "
                                : ""
                            } pl-5`}
                          >
                            {text}
                          </SyntaxHighlighter>
                          {text !== "\n" && (
                            <span className="bg-slate-900/20 rounded-full px-1 text-xs text-gray-600 max-h-[19px] flex items-center justify-center">
                              {time.toFixed(1)} ms
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  }
                })
              : JSON.stringify(filledArray)}
          </>
        }
      />
    </main>
  );
}

export default App;
