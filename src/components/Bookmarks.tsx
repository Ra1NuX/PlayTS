import { useState } from 'react';
import { Bookmark, NewBookmark, formatTags, parseTags } from "../utils/bookmarkUtils";
import { useBookmarksWithInjection } from "../hooks/useBookmarksWithInjection";
import { BookmarksHeader } from "./bookmarks/BookmarksHeader";
import { NewBookmarkForm } from "./bookmarks/NewBookmarkForm";
import { BookmarkEditForm } from "./bookmarks/BookmarkEditForm";
import { BookmarkCard } from "./bookmarks/BookmarkCard";
import { EmptyState } from "./bookmarks/EmptyState";

interface BookmarksProps {
  onCodeInjection?: (code: string) => void;
}

const Bookmarks = ({ onCodeInjection }: BookmarksProps) => {
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

  const {
    bookmarks,
    handleSaveBookmark,
    handleToggleGlobal,
    handleUpdateBookmark,
    filterBookmarksBySearch,
  } = useBookmarksWithInjection();

  const filteredBookmarks = filterBookmarksBySearch(searchTerm);

  const handleSaveNewBookmark = () => {
    if (newBookmark.name && newBookmark.code) {
      handleSaveBookmark(newBookmark);
      setNewBookmark({
        name: '',
        description: '',
        code: '',
        language: 'javascript',
        tags: [],
        isGloballyActive: false,
      });
      setShowAddForm(false);
    }
  };

  const handleEdit = (bookmark: Bookmark) => {
    setEditingId(bookmark.id);
    setEditingBookmark({ ...bookmark });
  };

  const handleSaveEdit = () => {
    if (editingBookmark) {
      handleUpdateBookmark(editingBookmark.id, editingBookmark);
      setEditingId(null);
      setEditingBookmark(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingBookmark(null);
  };

  const handleCopy = async (code: string, name: string) => {
    try {
      await navigator.clipboard.writeText(code);
      console.log(`Código de ${name} copiado al portapapeles`);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const handleUse = (name: string) => {
    const bookmark = bookmarks.find(bm => bm.name === name);
    if (bookmark && onCodeInjection) {
      onCodeInjection(bookmark.code);
    }
    console.log(`Usando bookmark: ${name}`);
  };

  const updateNewBookmark = (updates: Partial<NewBookmark>) => {
    setNewBookmark(prev => ({ ...prev, ...updates }));
  };

  const updateEditingBookmark = (updates: Partial<Bookmark>) => {
    setEditingBookmark(prev => prev ? { ...prev, ...updates } : null);
  };

  const updateNewBookmarkTags = (tagsString: string) => {
    setNewBookmark(prev => ({ ...prev, tags: parseTags(tagsString) }));
  };

  const updateEditingBookmarkTags = (tagsString: string) => {
    setEditingBookmark(prev => prev ? { ...prev, tags: parseTags(tagsString) } : null);
  };

  return (
    <div className="w-full mx-auto space-y-3 dark:text-gray-300 text-main-dark">
      <BookmarksHeader
        bookmarksCount={bookmarks.length}
        onAddClick={() => setShowAddForm(!showAddForm)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {showAddForm && (
        <NewBookmarkForm
          bookmark={newBookmark}
          onUpdate={updateNewBookmark}
          onUpdateTags={updateNewBookmarkTags}
          onSave={handleSaveNewBookmark}
          onCancel={() => setShowAddForm(false)}
          formatTags={formatTags}
        />
      )}

      <div className="grid gap-3">
        {filteredBookmarks.map((bookmark) => (
          <div key={bookmark.id} className="dark:bg-main-light bg-white rounded-lg border border-gray-200 dark:border-main-dark overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            {editingId === bookmark.id ? (
              <BookmarkEditForm
                bookmark={editingBookmark!}
                onSave={handleSaveEdit}
                onCancel={handleCancelEdit}
                onUpdate={updateEditingBookmark}
                onUpdateTags={updateEditingBookmarkTags}
                formatTags={formatTags}
              />
            ) : (
              <BookmarkCard
                bookmark={bookmark}
                onToggleGlobal={handleToggleGlobal}
                onCopy={handleCopy}
                onEdit={handleEdit}
                onUse={handleUse}
              />
            )}
          </div>
        ))}
      </div>

      {filteredBookmarks.length === 0 && (
        <EmptyState
          searchTerm={searchTerm}
          onAddClick={() => setShowAddForm(true)}
        />
      )}
    </div>
  );
};

export default Bookmarks;