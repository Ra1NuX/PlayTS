import { BsBookmark, BsPlus, BsSearch } from "react-icons/bs";
import { useTranslation } from "react-i18next";

interface BookmarksHeaderProps {
  bookmarksCount: number;
  onAddClick: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const BookmarksHeader = ({
  bookmarksCount,
  onAddClick,
  searchTerm,
  onSearchChange
}: BookmarksHeaderProps) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <h1 className="text-lg ml-1.5 font-bold truncate dark:text-white text-main-dark">{t('BOOKMARKS')}</h1>
          <span className="text-xs text-white font-light dark:bg-main-light bg-main-dark rounded-full px-1.5 py-0.5 flex-shrink-0">
            {bookmarksCount}
          </span>
        </div>
        <button
          onClick={onAddClick}
          className="flex items-center gap-1 bg-accent-dark hover:bg-hover-ancient-dark text-white px-5 py-1.5 rounded transition-colors font-semibold text-sm flex-shrink-0"
        >
          {/* <BsPlus className="h-3 w-3" /> */}
          <span className="hidden sm:inline">{t('NEW')}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <BsSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 dark:text-gray-300 text-gray-500 h-3 w-3" />
        <input
          type="text"
          placeholder={t('SEARCH')}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-7 pr-3 py-1.5 border border-gray-300 dark:border-divider-dark rounded-lg dark:bg-main-light dark:text-white dark:placeholder-gray-300 bg-white placeholder-gray-500  font-normal text-sm"
        />
      </div>
    </>
  );
};
