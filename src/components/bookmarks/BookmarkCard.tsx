import { Switch } from "@headlessui/react";
import { BsCode, BsCopy, BsPencil, BsPlay } from "react-icons/bs";
import { Bookmark } from "../../utils/bookmarkUtils";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  return (
    <div className="p-3">
      <div className="flex items-start justify-between mb-2">
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold dark:text-white text-main-dark truncate">{bookmark.name}</h3>
            <span className="bg-accent-dark text-xs text-white font-medium px-1.5 py-0.5 rounded-full flex-shrink-0">
              {bookmark.language}
            </span>
            {bookmark.isGloballyActive && (
              <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium px-1.5 py-0.5 rounded-full flex-shrink-0">
{t('ACTIVE')}
              </span>
            )}
          </div>
          <p className="dark:text-white text-main-light/60 text-xs line-clamp-2">{bookmark.description}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Switch
            checked={bookmark.isGloballyActive}
            onChange={() => onToggleGlobal(bookmark.id)}
            className={`${
              bookmark.isGloballyActive ? 'bg-accent-dark' : 'bg-gray-200 dark:bg-main-dark'
            } relative inline-flex flex-col px-0.5 items-center h-4 w-7 justify-center rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-accent-dark focus:ring-offset-1`}
          >
            <span
              className={`${
                bookmark.isGloballyActive ? 'self-end' : 'self-start'
              } inline-block h-3 w-3 rounded-full bg-white transition-all`}
            />
          </Switch>
        </div>
      </div>

      {/* Tags */}
      <div className="flex gap-1 mb-2 flex-wrap">
        {bookmark.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-xs dark:bg-main-dark bg-gray-100 dark:text-white text-main-dark border border-gray-300 dark:border-main-dark rounded-full px-1.5 py-0.5"
          >
            {tag}
          </span>
        ))}
        {bookmark.tags.length > 3 && (
          <span className="text-xs dark:text-gray-300 text-gray-500">+{bookmark.tags.length - 3}</span>
        )}
      </div>

      {/* Code Preview - Compact */}
      <div className="mb-2">
        <div className="bg-gray-50 dark:bg-main-dark rounded p-2 text-xs font-mono overflow-hidden">
          <div className="line-clamp-3 text-gray-700 dark:text-white">
            {bookmark.code}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-main-dark">
        <div className="flex items-center gap-1 text-xs dark:text-gray-300 text-gray-500">
          <BsCode className="h-3 w-3" />
          <span className="hidden sm:inline">{bookmark.createdAt.toLocaleDateString()}</span>
          <span className="sm:hidden">{bookmark.createdAt.toLocaleDateString().slice(0, 5)}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onCopy(bookmark.code, bookmark.name)}
            className="flex items-center gap-1 dark:bg-main-dark bg-gray-100 hover:bg-gray-200 dark:hover:bg-main-dark/80 dark:text-white text-main-dark border border-gray-300 dark:border-main-dark rounded px-2 py-1 text-xs transition-colors font-normal"
            title="Copiar"
          >
            <BsCopy className="h-3 w-3" />
            <span className="hidden sm:inline">{t('COPY')}</span>
          </button>

          <button
            onClick={() => onEdit(bookmark)}
            className="flex items-center gap-1 dark:bg-main-dark bg-gray-100 hover:bg-gray-200 dark:hover:bg-main-dark/80 dark:text-white text-main-dark border border-gray-300 dark:border-main-dark rounded px-2 py-1 text-xs transition-colors font-normal"
            title="Editar"
          >
            <BsPencil className="h-3 w-3" />
            <span className="hidden sm:inline">{t('EDIT')}</span>
          </button>

          <button
            onClick={() => onUse(bookmark.name)}
            className="flex items-center gap-1 bg-accent-dark hover:bg-hover-ancient-dark text-white border border-accent-dark rounded px-2 py-1 text-xs transition-colors font-semibold"
            title="Usar"
          >
            <BsPlay className="h-3 w-3" />
            <span className="hidden sm:inline">{t('USE')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
