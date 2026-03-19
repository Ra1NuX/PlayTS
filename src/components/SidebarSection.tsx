import { ReactNode } from "react";
import { Search } from "lucide-react";

interface SidebarSectionProps {
  title: string;
  count?: number;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (term: string) => void;
  headerAction?: ReactNode;
  children: ReactNode;
}

export const SidebarSection = ({
  title,
  count,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  headerAction,
  children,
}: SidebarSectionProps) => {
  const showSearch = searchPlaceholder !== undefined && onSearchChange !== undefined;
  const isControlled = searchValue !== undefined;

  return (
    <div className="w-full h-full flex flex-col dark:text-gray-100 text-gray-900">
      <div className="flex-shrink-0 px-1 pb-3 border-b dark:border-[#2a2a2a] border-gray-100 mb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h1 className="text-base font-semibold truncate dark:text-gray-100 text-gray-900">
              {title}
            </h1>
            {count !== undefined && (
              <span className="text-[11px] px-2 py-0.5 rounded-full dark:bg-[#2a2a2a] bg-gray-100 dark:text-gray-300 text-gray-600 font-medium flex-shrink-0">
                {count}
              </span>
            )}
          </div>
          {headerAction}
        </div>

        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 dark:text-gray-500 text-gray-400" />
            <input
              type="search"
              placeholder={searchPlaceholder}
              {...(isControlled ? { value: searchValue } : {})}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 pl-9 pr-3 text-sm rounded-lg border dark:bg-[#111] bg-gray-50 dark:border-[#2a2a2a] border-gray-200 dark:text-gray-100 dark:placeholder-gray-500 placeholder-gray-400 focus:ring-2 focus:ring-accent-dark/30 focus:border-accent-dark outline-none transition-colors w-full"
            />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {children}
      </div>
    </div>
  );
};
