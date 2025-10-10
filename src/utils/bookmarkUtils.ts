export interface Bookmark {
  id: string;
  name: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  createdAt: Date;
  isGloballyActive: boolean;
}

export interface NewBookmark {
  name: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  isGloballyActive: boolean;
}

export const generateBookmarkId = (): string => {
  return `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const createBookmark = (data: NewBookmark): Bookmark => {
  return {
    ...data,
    id: generateBookmarkId(),
    createdAt: new Date(),
  };
};

export const filterBookmarks = (bookmarks: Bookmark[], searchTerm: string): Bookmark[] => {
  if (!searchTerm.trim()) return bookmarks;
  
  const term = searchTerm.toLowerCase();
  return bookmarks.filter(bookmark =>
    bookmark.name.toLowerCase().includes(term) ||
    bookmark.description.toLowerCase().includes(term) ||
    bookmark.tags.some(tag => tag.toLowerCase().includes(term))
  );
};

export const updateBookmark = (bookmarks: Bookmark[], id: string, updates: Partial<Bookmark>): Bookmark[] => {
  return bookmarks.map(bookmark => 
    bookmark.id === id 
      ? { ...bookmark, ...updates }
      : bookmark
  );
};

export const toggleBookmarkGlobal = (bookmarks: Bookmark[], id: string): Bookmark[] => {
  return bookmarks.map(bookmark => 
    bookmark.id === id 
      ? { ...bookmark, isGloballyActive: !bookmark.isGloballyActive }
      : bookmark
  );
};

export const parseTags = (tagsString: string): string[] => {
  return tagsString
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
};

export const formatTags = (tags: string[]): string => {
  return tags.join(', ');
};

export const validateBookmark = (bookmark: NewBookmark): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!bookmark.name.trim()) {
    errors.push('El nombre es requerido');
  }
  
  if (!bookmark.code.trim()) {
    errors.push('El código es requerido');
  }
  
  if (bookmark.name.length > 100) {
    errors.push('El nombre es demasiado largo (máximo 100 caracteres)');
  }
  
  if (bookmark.description.length > 500) {
    errors.push('La descripción es demasiado larga (máximo 500 caracteres)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
