import { ReactNode } from "react";
import { BsSearch } from "react-icons/bs";

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
    <div className="w-full h-full flex flex-col dark:text-gray-300 text-main-dark">
      <div className="flex-shrink-0 space-y-3 mb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h1 className="text-lg ml-1.5 font-bold truncate dark:text-white text-main-dark">
              {title}
            </h1>
            {count !== undefined && (
              <span className="text-xs text-white font-light dark:bg-main-light bg-main-dark rounded-full px-1.5 py-0.5 flex-shrink-0">
                {count}
              </span>
            )}
          </div>
          {headerAction}
        </div>

        {showSearch && (
          <div className="relative">
            <BsSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 dark:text-gray-300 text-gray-500 h-3 w-3" />
            <input
              type="search"
              placeholder={searchPlaceholder}
              {...(isControlled ? { value: searchValue } : {})}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-7 pr-3 py-1.5 border border-gray-300 dark:border-divider-dark rounded dark:bg-main-light dark:text-white dark:placeholder-gray-300 bg-white placeholder-gray-500 font-normal text-sm"
            />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 ">
        {children}
      </div>
    </div>
  );
};
