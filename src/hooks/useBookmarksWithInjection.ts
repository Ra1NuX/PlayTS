import { useCallback } from 'react';
import { useBookmarks, useBookmarksActions } from '../stores/bookmarksStore';
import { Bookmark, NewBookmark, filterBookmarks } from '../utils/bookmarkUtils';

export const useBookmarksWithInjection = () => {
  const bookmarks = useBookmarks();
  const actions = useBookmarksActions();

  const handleSaveBookmark = useCallback((newBookmark: NewBookmark) => {
    actions.addBookmark(newBookmark);
  }, [actions]);

  const handleBookmarkChange = useCallback((updatedBookmarks: Bookmark[]) => {
    actions.setBookmarks(updatedBookmarks);
  }, [actions]);

  const handleToggleGlobal = useCallback((id: string) => {
    actions.toggleGlobal(id);
  }, [actions]);

  const handleUpdateBookmark = useCallback((id: string, updates: Partial<Bookmark>) => {
    actions.updateBookmark(id, updates);
  }, [actions]);

  const handleDeleteBookmark = useCallback((id: string) => {
    actions.deleteBookmark(id);
  }, [actions]);

  const filterBookmarksBySearch = useCallback((searchTerm: string) => {
    return filterBookmarks(bookmarks, searchTerm);
  }, [bookmarks]);

  return {
    // State
    bookmarks,
    
    // Actions
    handleSaveBookmark,
    handleBookmarkChange,
    handleToggleGlobal,
    handleUpdateBookmark,
    handleDeleteBookmark,
    filterBookmarksBySearch,
    
    // Direct actions (for advanced usage)
    ...actions,
  };
};