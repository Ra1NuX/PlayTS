import { Editor, useMonaco } from '@monaco-editor/react';
import { useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { darkTheme as monacoDarkTheme, lightTheme as monacoLightTheme } from '../../utils/customTheme';

interface MiniCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
}

export const MiniCodeEditor = ({ value, onChange, language = 'typescript' }: MiniCodeEditorProps) => {
  const { theme } = useTheme();
  const monaco = useMonaco();

  useEffect(() => {
    if (!monaco) return;

    try {
      monaco.editor.defineTheme("custom-dark", monacoDarkTheme as any);
      monaco.editor.defineTheme("custom-light", monacoLightTheme as any);
    } catch {
      console.warn('Failed to define Monaco editor themes');
    }
  }, [monaco]);

  const handleEditorDidMount = (editor: any, monacoInstance: any) => {
    const model = editor.getModel();
    if (!model) return;

    const disposable = model.onDidChangeContent(() => {
      monacoInstance.editor.setModelMarkers(model, 'typescript', []);
      monacoInstance.editor.setModelMarkers(model, 'javascript', []);
    });

    monacoInstance.editor.setModelMarkers(model, 'typescript', []);
    monacoInstance.editor.setModelMarkers(model, 'javascript', []);

    return () => {
      disposable.dispose();
    };
  };

  return (
    <div className="w-full h-48 border border-gray-300 dark:border-gray-600 rounded overflow-hidden">
      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={(value) => onChange(value || '')}
        onMount={handleEditorDidMount}
        theme={theme === 'dark' ? 'custom-dark' : 'custom-light'}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 13,
          lineNumbers: 'off',
          renderLineHighlight: 'none',
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          overviewRulerBorder: false,
          lineDecorationsWidth: 0,
          lineNumbersMinChars: 3,
          glyphMargin: false,
          folding: false,
          renderWhitespace: 'none',
          renderControlCharacters: false,
          fontFamily: 'JetBrains Mono, Consolas, monospace',
          tabSize: 2,
          insertSpaces: true,
          wordWrap: 'on',
          automaticLayout: true,
          padding: { top: 8, bottom: 8 },
        }}
      />
    </div>
  );
};

