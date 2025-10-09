import { useState, useCallback } from 'react';
import { Bookmark, NewBookmark, createBookmark, updateBookmark, toggleBookmarkGlobal, parseTags, formatTags, validateBookmark } from '../utils/bookmarkUtils';

interface UseBookmarksProps {
  initialBookmarks: Bookmark[];
  onBookmarkChange?: (bookmarks: Bookmark[]) => void;
  onSaveBookmark?: (bookmark: NewBookmark) => void;
}

export const useBookmarks = ({ initialBookmarks, onBookmarkChange, onSaveBookmark }: UseBookmarksProps) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [newBookmark, setNewBookmark] = useState<NewBookmark>({
    name: '',
    description: '',
    code: '',
    language: 'javascript',
    tags: [],
    isGloballyActive: false,
  });

  const handleBookmarkChange = useCallback((updatedBookmarks: Bookmark[]) => {
    setBookmarks(updatedBookmarks);
    onBookmarkChange?.(updatedBookmarks);
  }, [onBookmarkChange]);

  const handleToggleGlobal = useCallback((id: string) => {
    const updatedBookmarks = toggleBookmarkGlobal(bookmarks, id);
    handleBookmarkChange(updatedBookmarks);
  }, [bookmarks, handleBookmarkChange]);

  const handleSaveBookmark = useCallback(() => {
    const validation = validateBookmark(newBookmark);
    if (!validation.isValid) {
      console.error('Errores de validación:', validation.errors);
      return;
    }

    const bookmark = createBookmark(newBookmark);
    onSaveBookmark?.(newBookmark);
    
    setNewBookmark({
      name: '',
      description: '',
      code: '',
      language: 'javascript',
      tags: [],
      isGloballyActive: false,
    });
    setShowAddForm(false);
  }, [newBookmark, onSaveBookmark]);

  const handleEdit = useCallback((bookmark: Bookmark) => {
    setEditingId(bookmark.id);
    setEditingBookmark({ ...bookmark });
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingBookmark) return;

    const validation = validateBookmark(editingBookmark);
    if (!validation.isValid) {
      console.error('Errores de validación:', validation.errors);
      return;
    }

    const updatedBookmarks = updateBookmark(bookmarks, editingId!, editingBookmark);
    handleBookmarkChange(updatedBookmarks);
    setEditingId(null);
    setEditingBookmark(null);
  }, [editingBookmark, editingId, bookmarks, handleBookmarkChange]);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditingBookmark(null);
  }, []);

  const handleCopy = useCallback(async (code: string, name: string) => {
    try {
      await navigator.clipboard.writeText(code);
      console.log(`Código de ${name} copiado al portapapeles`);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  }, []);

  const handleUse = useCallback((name: string) => {
    const bookmark = bookmarks.find(bm => bm.name === name);
    if (bookmark) {
      console.log(`Usando bookmark: ${name}`);
      // Aquí se implementará la lógica de inyección de código
    }
  }, [bookmarks]);

  const updateNewBookmark = useCallback((updates: Partial<NewBookmark>) => {
    setNewBookmark(prev => ({ ...prev, ...updates }));
  }, []);

  const updateEditingBookmark = useCallback((updates: Partial<Bookmark>) => {
    setEditingBookmark(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const updateNewBookmarkTags = useCallback((tagsString: string) => {
    const tags = parseTags(tagsString);
    setNewBookmark(prev => ({ ...prev, tags }));
  }, []);

  const updateEditingBookmarkTags = useCallback((tagsString: string) => {
    const tags = parseTags(tagsString);
    setEditingBookmark(prev => prev ? { ...prev, tags } : null);
  }, []);

  return {
    // State
    bookmarks,
    searchTerm,
    showAddForm,
    editingId,
    editingBookmark,
    newBookmark,
    
    // Actions
    setSearchTerm,
    setShowAddForm,
    handleToggleGlobal,
    handleSaveBookmark,
    handleEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleCopy,
    handleUse,
    updateNewBookmark,
    updateEditingBookmark,
    updateNewBookmarkTags,
    updateEditingBookmarkTags,
    
    // Utils
    formatTags,
  };
};
