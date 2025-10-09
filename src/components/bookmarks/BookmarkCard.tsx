import { Switch } from "@headlessui/react";
import { BsCode, BsCopy, BsPencil, BsPlay } from "react-icons/bs";
import { Bookmark } from "../../utils/bookmarkUtils";

interface BookmarkCardProps {
  bookmark: Bookmark;
  onToggleGlobal: (id: string) => void;
  onCopy: (code: string, name: string) => void;
  onEdit: (bookmark: Bookmark) => void;
  onUse: (name: string) => void;
}

export const BookmarkCard = ({ 
  bookmark, 
  onToggleGlobal, 
  onCopy, 
  onEdit, 
  onUse 
}: BookmarkCardProps) => {
  return (
    <div className="p-3">
      <div className="flex items-start justify-between mb-2">
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold dark:text-white text-main-dark truncate">{bookmark.name}</h3>
            <span className="bg-[#d8e548] text-main-dark text-xs font-medium px-1.5 py-0.5 rounded-full flex-shrink-0">
              {bookmark.language}
            </span>
            {bookmark.isGloballyActive && (
              <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium px-1.5 py-0.5 rounded-full flex-shrink-0">
                Activa
              </span>
            )}
          </div>
          <p className="dark:text-gray-400 text-main-light/60 text-xs line-clamp-2">{bookmark.description}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Switch
            checked={bookmark.isGloballyActive}
            onChange={() => onToggleGlobal(bookmark.id)}
            className={`${
              bookmark.isGloballyActive ? 'bg-[#d8e548]' : 'bg-gray-200'
            } relative inline-flex h-4 w-7 items-center rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-[#d8e548] focus:ring-offset-1`}
          >
            <span
              className={`${
                bookmark.isGloballyActive ? 'translate-x-3' : 'translate-x-0.5'
              } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        </div>
      </div>

      {/* Tags */}
      <div className="flex gap-1 mb-2 flex-wrap">
        {bookmark.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-xs dark:bg-main-dark bg-gray-100 dark:text-gray-300 text-main-dark border border-gray-300 dark:border-main-dark rounded-full px-1.5 py-0.5"
          >
            {tag}
          </span>
        ))}
        {bookmark.tags.length > 3 && (
          <span className="text-xs text-gray-500">+{bookmark.tags.length - 3}</span>
        )}
      </div>

      {/* Code Preview - Compact */}
      <div className="mb-2">
        <div className="bg-gray-50 dark:bg-main-dark rounded p-2 text-xs font-mono overflow-hidden">
          <div className="line-clamp-3 text-gray-700 dark:text-gray-300">
            {bookmark.code}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-main-dark">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <BsCode className="h-3 w-3" />
          <span className="hidden sm:inline">{bookmark.createdAt.toLocaleDateString()}</span>
          <span className="sm:hidden">{bookmark.createdAt.toLocaleDateString().slice(0, 5)}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onCopy(bookmark.code, bookmark.name)}
            className="flex items-center gap-1 dark:bg-main-dark bg-gray-100 hover:bg-gray-200 dark:hover:bg-main-dark/80 dark:text-gray-300 text-main-dark border border-gray-300 dark:border-main-dark rounded px-2 py-1 text-xs transition-colors font-normal"
            title="Copiar"
          >
            <BsCopy className="h-3 w-3" />
            <span className="hidden sm:inline">Copiar</span>
          </button>

          <button
            onClick={() => onEdit(bookmark)}
            className="flex items-center gap-1 dark:bg-main-dark bg-gray-100 hover:bg-gray-200 dark:hover:bg-main-dark/80 dark:text-gray-300 text-main-dark border border-gray-300 dark:border-main-dark rounded px-2 py-1 text-xs transition-colors font-normal"
            title="Editar"
          >
            <BsPencil className="h-3 w-3" />
            <span className="hidden sm:inline">Editar</span>
          </button>

          <button
            onClick={() => onUse(bookmark.name)}
            className="flex items-center gap-1 bg-[#d8e548] hover:bg-[#c4d13a] text-main-dark border border-[#d8e548] rounded px-2 py-1 text-xs transition-colors font-semibold"
            title="Usar"
          >
            <BsPlay className="h-3 w-3" />
            <span className="hidden sm:inline">Usar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
