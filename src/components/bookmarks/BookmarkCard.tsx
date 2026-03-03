import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Switch } from "@headlessui/react";
import { BsCode, BsCopy, BsPencil, BsThreeDotsVertical, BsTrash } from "react-icons/bs";
import { Bookmark } from "../../utils/bookmarkUtils";
import { useTranslation } from "react-i18next";
import merge from "../../tools/merge";

interface BookmarkCardProps {
  bookmark: Bookmark;
  onToggleGlobal: (id: string) => void;
  onCopy: (code: string, name: string) => void;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
}

export const BookmarkCard = ({
  bookmark,
  onToggleGlobal,
  onCopy,
  onEdit,
  onDelete,
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
          </div>
          <p className="dark:text-white text-main-light/60 text-xs line-clamp-2">{bookmark.description}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
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

          <Menu as="div" className="relative">
            <MenuButton className="flex items-center justify-center w-6 h-6 rounded dark:text-gray-400 text-gray-500 dark:hover:text-gray-200 hover:text-gray-700 transition-colors">
              <BsThreeDotsVertical className="h-3.5 w-3.5" />
            </MenuButton>

            <MenuItems anchor="bottom end" className="z-50 w-44 dark:bg-main-light bg-white border border-gray-200 dark:border-divider-dark rounded shadow-lg focus:outline-none">
              <div className="py-1">
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => onCopy(bookmark.code, bookmark.name)}
                      className={merge(
                        'flex items-center gap-2 w-full px-3 py-1.5 text-xs transition-colors',
                        active
                          ? 'dark:bg-main-dark bg-gray-100 dark:text-white text-main-dark'
                          : 'dark:text-gray-300 text-gray-600'
                      )}
                    >
                      <BsCopy className="h-3.5 w-3.5" />
                      {t('COPY')}
                    </button>
                  )}
                </MenuItem>

                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => onEdit(bookmark)}
                      className={merge(
                        'flex items-center gap-2 w-full px-3 py-1.5 text-xs transition-colors',
                        active
                          ? 'dark:bg-main-dark bg-gray-100 dark:text-white text-main-dark'
                          : 'dark:text-gray-300 text-gray-600'
                      )}
                    >
                      <BsPencil className="h-3.5 w-3.5" />
                      {t('EDIT')}
                    </button>
                  )}
                </MenuItem>

                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => onDelete(bookmark.id)}
                      className={merge(
                        'flex items-center gap-2 w-full px-3 py-1.5 text-xs transition-colors',
                        active
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                          : 'text-red-500 dark:text-red-400'
                      )}
                    >
                      <BsTrash className="h-3.5 w-3.5" />
                      {t('DELETE')}
                    </button>
                  )}
                </MenuItem>
              </div>
            </MenuItems>
          </Menu>
        </div>
      </div>

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

      <div className="mb-2">
        <div className="bg-gray-50 dark:bg-main-dark rounded p-2 text-xs font-mono overflow-hidden">
          <div className="line-clamp-3 text-gray-700 dark:text-white">
            {bookmark.code}
          </div>
        </div>
      </div>

      <div className="flex items-center pt-2 border-t border-gray-200 dark:border-main-dark">
        <div className="flex items-center gap-1 text-xs dark:text-gray-300 text-gray-500">
          <BsCode className="h-3 w-3" />
          <span className="hidden sm:inline">{bookmark.createdAt.toLocaleDateString()}</span>
          <span className="sm:hidden">{bookmark.createdAt.toLocaleDateString().slice(0, 5)}</span>
        </div>
      </div>
    </div>
  );
};
