import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Switch } from "@headlessui/react";
import { Code, Copy, Pencil, MoreVertical, Trash2 } from "lucide-react";
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
    <div className="rounded-lg border dark:border-[#2a2a2a] border-gray-200 dark:bg-[#1a1a1a] bg-white p-4 hover:border-gray-300 dark:hover:border-[#333] transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold dark:text-gray-100 text-gray-900 truncate">{bookmark.name}</h3>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-accent-dark text-white font-medium flex-shrink-0">
              {bookmark.language}
            </span>
          </div>
          {bookmark.description && (
            <p className="dark:text-gray-400 text-gray-500 text-xs line-clamp-2">{bookmark.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
          <Switch
            checked={bookmark.isGloballyActive}
            onChange={() => onToggleGlobal(bookmark.id)}
            className={`${
              bookmark.isGloballyActive ? 'bg-accent-dark' : 'dark:bg-[#2a2a2a] bg-gray-200'
            } relative inline-flex flex-col px-0.5 items-center h-4 w-7 justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent-dark/30 cursor-pointer`}
          >
            <span
              className={`${
                bookmark.isGloballyActive ? 'self-end' : 'self-start'
              } inline-block h-3 w-3 rounded-full bg-white transition-all`}
            />
          </Switch>

          <Menu as="div" className="relative">
            <MenuButton className="flex items-center justify-center w-7 h-7 rounded-lg dark:text-gray-500 text-gray-400 dark:hover:text-gray-300 hover:text-gray-600 hover:dark:bg-[#2a2a2a] hover:bg-gray-100 transition-colors cursor-pointer">
              <MoreVertical className="h-3.5 w-3.5" />
            </MenuButton>

            <MenuItems anchor="bottom end" className="z-50 w-44 rounded-lg border dark:border-[#2a2a2a] border-gray-200 dark:bg-[#1a1a1a] bg-white shadow-lg focus:outline-none overflow-hidden">
              <div className="py-1">
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => onCopy(bookmark.code, bookmark.name)}
                      className={merge(
                        'flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors cursor-pointer',
                        active
                          ? 'dark:bg-[#111] bg-gray-50 dark:text-gray-100 text-gray-900'
                          : 'dark:text-gray-400 text-gray-500'
                      )}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      {t('COPY')}
                    </button>
                  )}
                </MenuItem>

                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => onEdit(bookmark)}
                      className={merge(
                        'flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors cursor-pointer',
                        active
                          ? 'dark:bg-[#111] bg-gray-50 dark:text-gray-100 text-gray-900'
                          : 'dark:text-gray-400 text-gray-500'
                      )}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      {t('EDIT')}
                    </button>
                  )}
                </MenuItem>

                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => onDelete(bookmark.id)}
                      className={merge(
                        'flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors cursor-pointer',
                        active
                          ? 'bg-red-500/10 text-red-400'
                          : 'text-red-500 hover:text-red-400'
                      )}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {t('DELETE')}
                    </button>
                  )}
                </MenuItem>
              </div>
            </MenuItems>
          </Menu>
        </div>
      </div>

      {bookmark.tags.length > 0 && (
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {bookmark.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[11px] px-2 py-0.5 rounded-full dark:bg-[#2a2a2a] bg-gray-100 dark:text-gray-300 text-gray-600"
            >
              {tag}
            </span>
          ))}
          {bookmark.tags.length > 3 && (
            <span className="text-[11px] px-2 py-0.5 dark:text-gray-500 text-gray-400">+{bookmark.tags.length - 3}</span>
          )}
        </div>
      )}

      <div className="mb-3">
        <div className="text-xs font-mono dark:bg-[#111] bg-gray-50 rounded-lg p-3 border dark:border-[#2a2a2a] border-gray-200 overflow-hidden">
          <div className="line-clamp-3 dark:text-gray-300 text-gray-600 whitespace-pre-wrap">
            {bookmark.code}
          </div>
        </div>
      </div>

      <div className="flex items-center pt-3 border-t dark:border-[#2a2a2a] border-gray-200">
        <div className="flex items-center gap-1.5 dark:text-gray-500 text-gray-400">
          <Code className="h-3 w-3" />
          <span className="text-[11px] hidden sm:inline">{bookmark.createdAt.toLocaleDateString()}</span>
          <span className="text-[11px] sm:hidden">{bookmark.createdAt.toLocaleDateString().slice(0, 5)}</span>
        </div>
      </div>
    </div>
  );
};
