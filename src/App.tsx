import { useEffect, useRef, useState } from "react";
import { Editor, EditorProps, useMonaco } from "@monaco-editor/react";

import useCompiler from "./hooks/useCompiler";
import fillSpaces from "./utils/fillSpaces";
import SyntaxHighlighter from "react-syntax-highlighter";
import { darkTheme, lightTheme, monacoDarkTheme, monacoLightTheme } from "./utils/customTheme";
import Header from "./components/Header";
import DraggableDivider from "./components/DraggableDivider";
import Sidebar from "./components/Sidebar";
import { useTheme } from "./hooks/useTheme";
import { useTranslation } from "react-i18next";
import { useFont } from "./hooks/useFonts";

const editorOptions: EditorProps["options"] = {
  minimap: { enabled: false }, // Elimina el minimapa
  // fontFamily: "Fira Code, monospace", // Cambia el estilo de la fuente
  fontSize: 18, // Cambia el tamaño de la fuente
  lineNumbers: "off",
  renderLineHighlight: "none",
  "semanticHighlighting.enabled": "configuredByTheme",
  cursorBlinking: "expand",
  lineHeight: 29,
  glyphMargin: false,
  wordWrap: 'on',
  scrollBeyondLastLine: false,
  scrollbar: {
    vertical: 'auto',
    useShadows: false,
  },
  fontLigatures: true,
  fontVariations: true,
  
};

function App() {
  const { result, writting } = useCompiler();
  const { t } = useTranslation();
  const monaco = useMonaco();

  const rightContainerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);

  const { theme } = useTheme();

  const [defaultCode, setDefaultCode] = useState(t('DEFAULT_CODE'));

  useEffect(() => {
    if(window.electron) {
      const main = async () => {
        const log = await import('electron-log/renderer');
        console = log as any;
      }

      main();
    }
  }, [])

  useEffect(() => {
    if (!monaco) return;

    monaco.editor.defineTheme("custom-dark", monacoDarkTheme as any);
    monaco.editor.defineTheme("custom-light", monacoLightTheme as any);
    monaco.editor.setTheme(theme === "dark" ? "custom-dark" : "custom-light");
    
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.Latest,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      lib: ["esnext", "dom"], // Si usas DOM
      strict: true,
      allowNonTsExtensions: true,
      skipLibCheck: true,
    })

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
      diagnosticCodesToIgnore: [1375, 2307, 7006, 2367, 2839, 2845]
    })
  }, [monaco, theme]);

  useEffect(() => {
    const code = atob(localStorage.getItem('code')||'');
    if(code) {
      setDefaultCode(code);
      writting(code);
    }
  }, [])

  const { font, size } = useFont()

  const filledArray = fillSpaces(result || []);

  return (
    <main className="h-screen flex flex-col font-[roboto] font-bold">
      <Header />
      <section className="flex flex-row flex-1 w-full overflow-hidden">
        <Sidebar />
        <DraggableDivider
        leftComponent={
          <Editor
            onMount={(editor) => {
              editorRef.current = editor;
              editor.onDidScrollChange(() => {
                const scrollTop = editor.getScrollTop();
                const scrollHeight = editor.getScrollHeight();
                const editorHeight = editor.getLayoutInfo().height;
          
                if (rightContainerRef.current) {
                  const rightScrollHeight = rightContainerRef.current.scrollHeight;
                  const rightHeight = rightContainerRef.current.clientHeight;
                  const ratio = scrollTop / (scrollHeight - editorHeight);
                  const rightScrollTop = ratio * (rightScrollHeight - rightHeight);
                  rightContainerRef.current.scrollTop = rightScrollTop;
                }
              });
            }}
            loading={false}
            defaultLanguage="typescript"
            language="typescript"
            defaultValue={defaultCode}
            onChange={(e) => {
              writting(e || "");
            }}
            options={{...editorOptions, fontFamily: font, fontSize: size}}
            className="font-mono leading-none w-full flex flex-1 focus-visible:outline-none resize-none"
          />
        }
        rightComponent={
          <div ref={rightContainerRef} className="break-words overflow-y-auto font-semibold font-mono leading-none dark:bg-main-light bg-[#eaeaea] rounded-md rounded-l-none border-l dark:border-l-main-dark border-l-[#f7f7f7] w-full flex flex-col flex-1 p-2 px-4">
            {Array.isArray(filledArray)
              ? filledArray?.map((element, i) => {
                  if (element) {
                    const { text } = element;
                    return (
                      <div className="flex w-full rounded" key={element.text+'-'+element.line+'-'+i}>
                        <div className="flex w-full justify-between font-mono">
                          <SyntaxHighlighter
                            language="javascript"
                            codeTagProps={{ style: { whiteSpace: "pre-wrap", fontFamily: `"${font}"`, fontSize: size } }}
                            PreTag={"pre"}
                            style={theme === "dark" ? darkTheme : lightTheme}
                            customStyle={{
                              padding: 0,
                              paddingLeft: "1.25rem",
                              backgroundColor: "transparent",
                              color: theme === 'dark' ? "#fafafa" : "#0008",
                              lineHeight: "27px",
                            }}
                            className={`font-normal text-[#f1fa8c] ${
                              text !== "\n"
                                ? "border-l-4 border-gray-900/10 "
                                : ""
                            } pl-5`}
                          >
                            {text}
                          </SyntaxHighlighter>
                        </div>
                      </div>
                    );
                  }
                })
              : JSON.stringify(filledArray)}
          </div>
        }
      />
      </section>
     
    </main>
  );
}

export default App;
