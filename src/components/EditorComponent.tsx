import { Editor, EditorProps, useMonaco } from "@monaco-editor/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { monacoDarkTheme, monacoLightTheme } from "../utils/customTheme";
import { useTheme } from "../hooks/useTheme";
import useCompiler from "../hooks/useCompiler";
import { useFont } from "../hooks/useFonts";
import debounce from "../tools/debounce";

const EditorComponent = () => {
  const { updateCode, code } = useCompiler();
  const { font, size } = useFont();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const monaco = useMonaco();

  const [defaultCode, setDefaultCode] = useState(code);

  const editorRef = useRef<any>(null);

  const editorOptions: EditorProps["options"] = useMemo(() => ({
    minimap: { enabled: false },
    fontSize: size,
    lineNumbers: "off",
    renderLineHighlight: "none",
    "semanticHighlighting.enabled": "configuredByTheme",
    cursorBlinking: "expand",
    lineHeight: 29,
    glyphMargin: false,
    wordWrap: "on",
    scrollBeyondLastLine: false,
    scrollbar: {
      vertical: "auto",
      useShadows: false,
    },
    fontLigatures: true,
    fontVariations: true,
    fontFamily: font,
  }), [font, size]);

  
  const handleChange = useCallback(
    debounce((e: string|undefined) => {
      updateCode(e??'');
    }, 300),
    []
  );

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
    });

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
      diagnosticCodesToIgnore: [1375, 2307, 7006, 2367, 2839, 2845],
    });
  }, [monaco, theme]);

  useEffect(() => {
    const code = atob(localStorage.getItem("code") || "");
    setDefaultCode(code || t("DEFAULT_CODE"));
    updateCode(code || t("DEFAULT_CODE"));
  }, []);

  const handleEditorMount = useCallback((editor: any) => {
    editorRef.current = editor;
     // editor.onDidScrollChange(() => {
        //   const scrollTop = editor.getScrollTop();
        //   const scrollHeight = editor.getScrollHeight();
        //   const editorHeight = editor.getLayoutInfo().height;

        //   if (rightContainerRef.current) {
        //     const rightScrollHeight = rightContainerRef.current.scrollHeight;
        //     const rightHeight = rightContainerRef.current.clientHeight;
        //     const ratio = scrollTop / (scrollHeight - editorHeight);
        //     const rightScrollTop = ratio * (rightScrollHeight - rightHeight);
        //     rightContainerRef.current.scrollTop = rightScrollTop;
        //   }
        // });
  }, []);

  return (
    <Editor
      onMount={handleEditorMount}
      loading={false}
      defaultLanguage="typescript"
      language="typescript"
      defaultValue={defaultCode}
      value={code}
      onChange={handleChange}
      options={{ ...editorOptions }}
      className="font-mono leading-none w-full flex flex-1 focus-visible:outline-none resize-none"
    />
  );
};

export default EditorComponent;
