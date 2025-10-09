import { useEffect, useRef } from 'react';
import { Bookmark } from '../utils/bookmarkUtils';
import { getActiveBookmarks, generateGlobalBookmarkCode } from '../utils/bookmarkInjection';
import { setGlobalBookmarksCode } from './useCompiler';

interface UseGlobalBookmarksProps {
  bookmarks: Bookmark[];
}

export const useGlobalBookmarks = ({ bookmarks }: UseGlobalBookmarksProps) => {
  const lastBookmarksKeyRef = useRef<string>('');

  useEffect(() => {
    const activeBookmarks = getActiveBookmarks(bookmarks);
    
    const bookmarksKey = JSON.stringify(
      activeBookmarks.map(b => ({ id: b.id, code: b.code }))
    );
    
    if (bookmarksKey === lastBookmarksKeyRef.current) {
      return;
    }
    
    lastBookmarksKeyRef.current = bookmarksKey;

    const globalCode = generateGlobalBookmarkCode(activeBookmarks);
    
    setGlobalBookmarksCode(globalCode, true);
  }, [bookmarks]);
};