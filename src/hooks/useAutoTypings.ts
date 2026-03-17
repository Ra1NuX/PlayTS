import { useEffect, useRef, useCallback } from 'react';
import { useMonaco, Monaco } from '@monaco-editor/react';
import { setupTypeAcquisition } from '@typescript/ata';

// Save native console before electron-log overwrites it
const nativeConsole = { ...globalThis.console };

function preProcessFile(code: string) {
  const importedFiles: { fileName: string; pos: number; end: number }[] = [];
  const referencedFiles: { fileName: string; pos: number; end: number }[] = [];
  const libReferenceDirectives: { fileName: string; pos: number; end: number }[] = [];

  const importRegex = /(?:import|export)\s+(?:.*?\s+from\s+)?['"]([^'"]+)['"]/g;
  let match: RegExpExecArray | null;
  while ((match = importRegex.exec(code)) !== null) {
    const fileName = match[1];
    const pos = match.index + match[0].lastIndexOf(fileName);
    importedFiles.push({ fileName, pos, end: pos + fileName.length });
  }

  const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = requireRegex.exec(code)) !== null) {
    const fileName = match[1];
    const pos = match.index + match[0].lastIndexOf(fileName);
    importedFiles.push({ fileName, pos, end: pos + fileName.length });
  }

  const refPathRegex = /\/\/\/\s*<reference\s+path\s*=\s*['"]([^'"]+)['"]\s*\/>/g;
  while ((match = refPathRegex.exec(code)) !== null) {
    const fileName = match[1];
    const pos = match.index + match[0].lastIndexOf(fileName);
    referencedFiles.push({ fileName, pos, end: pos + fileName.length });
  }

  const refLibRegex = /\/\/\/\s*<reference\s+lib\s*=\s*['"]([^'"]+)['"]\s*\/>/g;
  while ((match = refLibRegex.exec(code)) !== null) {
    const fileName = match[1];
    const pos = match.index + match[0].lastIndexOf(fileName);
    libReferenceDirectives.push({ fileName, pos, end: pos + fileName.length });
  }

  return { importedFiles, referencedFiles, libReferenceDirectives };
}

const typescriptShim = {
  preProcessFile,
  libMap: new Map<string, string>(),
};

const TS_KIND_TO_COMPLETION_KIND: Record<string, number> = {
  'keyword': 17, 'variable': 5, 'local variable': 5, 'property': 9,
  'getter': 9, 'setter': 9, 'function': 1, 'method': 0, 'constructor': 0,
  'class': 6, 'interface': 7, 'enum': 15, 'enum member': 16, 'module': 8,
  'type': 7, 'type parameter': 24, 'alias': 4, 'const': 21, 'let': 5,
};

/** Deduplicate completion entries, keeping the shortest source path per name+kind. */
function deduplicateEntries(entries: any[]): any[] {
  const seen = new Map<string, any>();
  for (const entry of entries) {
    const key = entry.source ? `${entry.name}::${entry.kind}` : `${entry.name}::${entry.kind}::local`;
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, entry);
    } else if (entry.source && existing.source && entry.source.length < existing.source.length) {
      seen.set(key, entry);
    }
  }
  return Array.from(seen.values());
}

/** Resolve a completion item by fetching details and building auto-import text edits. */
async function resolveCompletionItem(item: any, monaco: Monaco) {
  const worker = await monaco.languages.typescript.getTypeScriptWorker();
  const client = await worker(item._uri);

  const details = await client.getCompletionEntryDetails(
    item._uri.toString(), item._offset, item._name,
    {}, item._source, undefined, item._data
  );
  if (!details) return item;

  const displayParts = details.displayParts?.map((p: any) => p.text).join('') ?? '';
  const docParts = details.documentation?.map((p: any) => p.text).join('') ?? '';

  item.detail = displayParts;
  if (docParts) item.documentation = { value: docParts };

  if (details.codeActions?.length) {
    const textEdits: any[] = [];
    for (const action of details.codeActions) {
      for (const change of action.changes) {
        for (const textChange of change.textChanges) {
          const startPos = item._uri.authority
            ? { lineNumber: 1, column: 1 }
            : getPositionFromOffset(textChange.span.start, item._uri, monaco);
          const endPos = item._uri.authority
            ? { lineNumber: 1, column: 1 }
            : getPositionFromOffset(textChange.span.start + textChange.span.length, item._uri, monaco);
          textEdits.push({
            range: new monaco.Range(startPos.lineNumber, startPos.column, endPos.lineNumber, endPos.column),
            text: textChange.newText,
          });
        }
      }
    }
    item.additionalTextEdits = textEdits;
  }
  return item;
}

/**
 * Register a CompletionItemProvider that supports auto-imports.
 * Monaco's built-in provider doesn't handle auto-import code actions, so we do it manually.
 */
function registerAutoImportProvider(monaco: Monaco) {
  return monaco.languages.registerCompletionItemProvider('typescript', {
    triggerCharacters: ['.', '"', "'", '/', '<'],

    async provideCompletionItems(model, position) {
      const worker = await monaco.languages.typescript.getTypeScriptWorker();
      const client = await worker(model.uri);
      const offset = model.getOffsetAt(position);
      const completions = await client.getCompletionsAtPosition(model.uri.toString(), offset);
      if (!completions) return { suggestions: [] };

      const wordInfo = model.getWordUntilPosition(position);
      const wordRange = new monaco.Range(
        position.lineNumber, wordInfo.startColumn, position.lineNumber, wordInfo.endColumn
      );

      const suggestions = deduplicateEntries(completions.entries).map((entry: any) => {
        let range = wordRange;
        if (entry.replacementSpan) {
          const p1 = model.getPositionAt(entry.replacementSpan.start);
          const p2 = model.getPositionAt(entry.replacementSpan.start + entry.replacementSpan.length);
          range = new monaco.Range(p1.lineNumber, p1.column, p2.lineNumber, p2.column);
        }
        const detail = entry.source ? `Auto import from '${entry.source}'` : undefined;
        return {
          label: { label: entry.name, description: detail },
          kind: TS_KIND_TO_COMPLETION_KIND[entry.kind] ?? 9,
          insertText: entry.insertText || entry.name,
          range, sortText: entry.sortText,
          _source: entry.source, _data: entry.data,
          _uri: model.uri, _offset: offset, _name: entry.name,
        };
      });
      return { suggestions };
    },

    async resolveCompletionItem(item: any) {
      return resolveCompletionItem(item, monaco);
    },
  });
}

function getPositionFromOffset(offset: number, uri: any, monaco: Monaco) {
  const model = monaco.editor.getModel(uri);
  if (model) {
    return model.getPositionAt(offset);
  }
  return { lineNumber: 1, column: 1 };
}

export const useAutoTypings = () => {
  const monaco = useMonaco();
  const ataRef = useRef<((code: string) => Promise<void>) | null>(null);
  const pendingCodeRef = useRef<string | null>(null);
  const installedPackagesRef = useRef<string[]>([]);
  const providerDisposableRef = useRef<any>(null);

  useEffect(() => {
    if (!monaco) return;

    nativeConsole.debug('[ATA] Initializing');

    monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);

    // Use custom worker that passes auto-import preferences to the TS language service
    monaco.languages.typescript.typescriptDefaults.setWorkerOptions({
      customWorkerPath: new URL('/ts-worker-overrides.js', window.location.origin).toString(),
    });

    // Disable built-in completions to avoid duplicates with our custom provider
    monaco.languages.typescript.typescriptDefaults.setModeConfiguration({
      completionItems: false,
      hovers: true,
      documentSymbols: true,
      definitions: true,
      references: true,
      documentHighlights: true,
      rename: true,
      diagnostics: true,
      documentRangeFormattingEdits: true,
      signatureHelp: true,
      onTypeFormattingEdits: true,
      codeActions: true,
      inlayHints: true,
    });

    // Register auto-import completion provider
    if (providerDisposableRef.current) {
      providerDisposableRef.current.dispose();
    }
    providerDisposableRef.current = registerAutoImportProvider(monaco);

    const ata = setupTypeAcquisition({
      projectName: 'PlayTS',
      typescript: typescriptShim as any,
      delegate: {
        receivedFile: (code: string, path: string) => {
          monaco.languages.typescript.typescriptDefaults.addExtraLib(code, `file://${path}`);
        },
        errorMessage: (msg: string, err: Error) => {
          nativeConsole.warn('[ATA] Error:', msg, err);
        },
        started: () => {
          nativeConsole.debug('[ATA] Acquiring types...');
        },
        finished: (files) => {
          nativeConsole.debug('[ATA] Done. Files loaded:', files.size);
        },
      },
    });

    ataRef.current = ata;

    const pending = pendingCodeRef.current ?? '';
    pendingCodeRef.current = null;
    const combined = buildCombinedCode(pending, installedPackagesRef.current);
    if (combined) {
      nativeConsole.debug('[ATA] Processing queued code + packages...');
      ata(combined).catch((err) => nativeConsole.warn('[ATA] Error:', err));
    }

    return () => {
      if (providerDisposableRef.current) {
        providerDisposableRef.current.dispose();
        providerDisposableRef.current = null;
      }
    };
  }, [monaco]);

  const acquireTypes = useCallback((code: string) => {
    const combined = buildCombinedCode(code, installedPackagesRef.current);
    if (ataRef.current) {
      ataRef.current(combined).catch((err) => nativeConsole.warn('[ATA] Error:', err));
    } else {
      pendingCodeRef.current = combined;
    }
  }, []);

  const setInstalledPackages = useCallback((packageNames: string[]) => {
    installedPackagesRef.current = packageNames;
    if (!ataRef.current || packageNames.length === 0) return;
    const syntheticCode = packageNames.map(name => `import '${name}';`).join('\n');
    nativeConsole.debug('[ATA] Preloading types for:', packageNames);
    ataRef.current(syntheticCode).catch((err) => nativeConsole.warn('[ATA] Preload error:', err));
  }, []);

  return { acquireTypes, setInstalledPackages };
};

function buildCombinedCode(userCode: string, packageNames: string[]): string {
  const syntheticImports = packageNames.map(name => `import '${name}';`).join('\n');
  return syntheticImports ? `${syntheticImports}\n${userCode}` : userCode;
}
