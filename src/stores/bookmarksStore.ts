import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Bookmark, NewBookmark, createBookmark, updateBookmark, toggleBookmarkGlobal } from '../utils/bookmarkUtils';

interface BookmarksStore {
  bookmarks: Bookmark[];
  addBookmark: (bookmark: NewBookmark) => void;
  updateBookmark: (id: string, updates: Partial<Bookmark>) => void;
  deleteBookmark: (id: string) => void;
  toggleGlobal: (id: string) => void;
  setBookmarks: (bookmarks: Bookmark[]) => void;
  getBookmarkById: (id: string) => Bookmark | undefined;
  getActiveBookmarks: () => Bookmark[];
}

export const useBookmarksStore = create<BookmarksStore>()(
  persist(
    (set, get) => ({
      bookmarks: [],

      addBookmark: (newBookmark: NewBookmark) => {
        const bookmark = createBookmark(newBookmark);
        set((state) => ({
          bookmarks: [...state.bookmarks, bookmark]
        }));
      },

      updateBookmark: (id: string, updates: Partial<Bookmark>) => {
        set((state) => ({
          bookmarks: updateBookmark(state.bookmarks, id, updates)
        }));
      },

      deleteBookmark: (id: string) => {
        set((state) => ({
          bookmarks: state.bookmarks.filter(bookmark => bookmark.id !== id)
        }));
      },

      toggleGlobal: (id: string) => {
        set((state) => ({
          bookmarks: toggleBookmarkGlobal(state.bookmarks, id)
        }));
      },

      setBookmarks: (bookmarks: Bookmark[]) => {
        set({ bookmarks });
      },

      getBookmarkById: (id: string) => {
        return get().bookmarks.find(bookmark => bookmark.id === id);
      },

      getActiveBookmarks: () => {
        return get().bookmarks.filter(bookmark => bookmark.isGloballyActive);
      },
    }),
    {
      name: 'bookmarks-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ bookmarks: state.bookmarks }),
      onRehydrateStorage: () => (state) => {
        if (state?.bookmarks) {
          state.bookmarks = state.bookmarks.map(bookmark => ({
            ...bookmark,
            createdAt: new Date(bookmark.createdAt)
          }));
        }
      },
    }
  )
);

export const useBookmarks = () => useBookmarksStore((state) => state.bookmarks);

export const useBookmarksActions = () => {
  return {
    addBookmark: useBookmarksStore.getState().addBookmark,
    updateBookmark: useBookmarksStore.getState().updateBookmark,
    deleteBookmark: useBookmarksStore.getState().deleteBookmark,
    toggleGlobal: useBookmarksStore.getState().toggleGlobal,
    setBookmarks: useBookmarksStore.getState().setBookmarks,
  };
};

export const useActiveBookmarks = () => useBookmarksStore((state) => state.bookmarks.filter(b => b.isGloballyActive));
