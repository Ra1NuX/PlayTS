import { useEffect, useRef } from 'react';
import { useMonaco } from '@monaco-editor/react';
import { Bookmark } from '../utils/bookmarkUtils';
import { generateBookmarkTypes } from '../utils/typeGeneration';

interface UseMonacoTypesProps {
  bookmarks: Bookmark[];
}

export const useMonacoTypes = ({ bookmarks }: UseMonacoTypesProps) => {
  const monaco = useMonaco();
  const disposablesRef = useRef<any[]>([]);

  useEffect(() => {
    if (!monaco) return;

    disposablesRef.current.forEach(disposable => disposable?.dispose());
    disposablesRef.current = [];

    const activeBookmarks = bookmarks.filter(b => b.isGloballyActive);

    if (activeBookmarks.length > 0) {
      const bookmarkTypes = generateBookmarkTypes(activeBookmarks);

      if (bookmarkTypes) {
        const disposable = monaco.languages.typescript.typescriptDefaults.addExtraLib(
          bookmarkTypes,
          'ts:bookmarks.d.ts'
        );

        disposablesRef.current.push(disposable);
      }
    }

    return () => {
      disposablesRef.current.forEach(disposable => disposable?.dispose());
      disposablesRef.current = [];
    };
  }, [monaco, bookmarks]);
};
