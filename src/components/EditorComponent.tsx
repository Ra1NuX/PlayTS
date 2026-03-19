import { Editor, EditorProps, useMonaco } from "@monaco-editor/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { monacoDarkTheme, monacoLightTheme } from "../utils/customTheme";
import { useTheme } from "../hooks/useTheme";
import useCompiler from "../hooks/useCompiler";
import { useFont } from "../hooks/useFonts";
import debounce from "../tools/debounce";
import { useBookmarks } from "../stores/bookmarksStore";
import { useMonacoTypes } from "../hooks/useMonacoTypes";
import { useAutoTypings } from "../hooks/useAutoTypings";
import useDependencies from "../hooks/useDependencies";
import { STORAGE_KEYS } from "../constants/localStorage";

const EditorComponent = () => {
  const { updateCode, code } = useCompiler();
  const { font, size } = useFont();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const monaco = useMonaco();
  const bookmarks = useBookmarks();
  const { packages } = useDependencies();
  const { acquireTypes, setInstalledPackages } = useAutoTypings();

  useMonacoTypes({ bookmarks });

  // When installed packages change, preload their types for auto-import
  useEffect(() => {
    setInstalledPackages(Object.keys(packages));
  }, [packages, setInstalledPackages]);

  const [defaultCode, setDefaultCode] = useState(code);

  const editorRef = useRef<any>(null);

  const editorOptions: EditorProps["options"] = useMemo(
    () => ({
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
      quickSuggestions: {
        other: true,
        comments: false,
        strings: true,
      },
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: "on",
      tabCompletion: "on",
      wordBasedSuggestions: false,
      suggest: {
        showWords: false,
        showMethods: true,
        showFunctions: true,
        showConstructors: true,
        showFields: true,
        showVariables: true,
        showClasses: true,
        showStructs: true,
        showInterfaces: true,
        showModules: true,
        showProperties: true,
        showEvents: true,
        showOperators: true,
        showUnits: true,
        showValues: true,
        showConstants: true,
        showEnums: true,
        showEnumMembers: true,
        showKeywords: false,
        showSnippets: false,
      },
      parameterHints: {
        enabled: true,
      },
    }),
    [font, size]
  );

  const debouncedUpdateCode = useMemo(() => {
    return debounce((value?: string) => {
      updateCode(value ?? '');
    }, 500);
  }, [updateCode]);

  const debouncedAcquireTypes = useMemo(() => {
    return debounce((value?: string) => {
      if (value) acquireTypes(value);
    }, 1000);
  }, [acquireTypes]);

  const handleChange = useCallback((value?: string) => {
    debouncedUpdateCode(value);
    debouncedAcquireTypes(value);
  }, [debouncedUpdateCode, debouncedAcquireTypes]);

  useEffect(() => {
    if (!monaco) return;

    monaco.editor.defineTheme("custom-dark", monacoDarkTheme as any);
    monaco.editor.defineTheme("custom-light", monacoLightTheme as any);
    monaco.editor.setTheme(theme === "dark" ? "custom-dark" : "custom-light");

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.Latest,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      lib: ["esnext", "dom"],
      strict: true,
      allowNonTsExtensions: true,
      skipLibCheck: true,
      esModuleInterop: true,
      allowJs: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      noEmit: true,
      typeRoots: ['node_modules/@types'],
    });

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.Latest,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      allowNonTsExtensions: true,
      esModuleInterop: true,
      allowJs: true,
      noEmit: true,
    });

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
      diagnosticCodesToIgnore: [1375, 2307, 7006, 2367, 2839, 2845],
    });
  }, [monaco, theme]);

  useEffect(() => {
    const code = atob(localStorage.getItem(STORAGE_KEYS.CODE) || "");
    const initialCode = code || t("DEFAULT_CODE");
    setDefaultCode(initialCode);
    updateCode(initialCode);
    acquireTypes(initialCode);
  }, []);

  const handleEditorMount = useCallback((editor: any) => {
    editorRef.current = editor;
  }, []);

  return (
    <Editor
      onMount={handleEditorMount}
      loading={false}
      defaultLanguage="typescript"
      language="typescript"
      defaultValue={defaultCode}
      value={code}
      path="file:///main.tsx"
      onChange={handleChange}
      options={{ ...editorOptions }}
      className="font-mono leading-none w-full flex flex-1 focus-visible:outline-none resize-none"
    />
  );
};

export default EditorComponent;
