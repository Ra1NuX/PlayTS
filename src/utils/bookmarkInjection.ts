import { Bookmark } from './bookmarkUtils';
import transpileTypeScript from '../tools/convertToJS';

export const injectBookmarkCode = (bookmark: Bookmark): string => {
  const { name, code, language, description } = bookmark;
  const header = `// Bookmark: ${name}${description ? ` - ${description}` : ''} (${language})`;
  return `${header}\n${code}`;
};

export const getActiveBookmarks = (bookmarks: Bookmark[]): Bookmark[] => {
  return bookmarks.filter(bookmark => bookmark.isGloballyActive);
};

export const generateGlobalBookmarkCode = (activeBookmarks: Bookmark[]): string => {
  if (activeBookmarks.length === 0) return '';
  
  const bookmarkFunctions = activeBookmarks.map(bookmark => {
    const { name, code, description } = bookmark;
    
    let jsCode = code;
    try {
      jsCode = transpileTypeScript(code);
    } catch {}
    
    return `// Bookmark: ${name}${description ? ` - ${description}` : ''}\n${jsCode}`;
  }).join('\n\n');
  
  return `// Global Bookmarks\n${bookmarkFunctions}`;
};

export const injectBookmarkIntoCode = (originalCode: string, bookmark: Bookmark): string => {
  const bookmarkCode = injectBookmarkCode(bookmark);
  return `${originalCode}\n\n${bookmarkCode}`;
};

export const replaceCodeWithBookmark = (bookmark: Bookmark): string => {
  return injectBookmarkCode(bookmark);
};
