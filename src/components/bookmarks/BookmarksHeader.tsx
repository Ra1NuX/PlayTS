import { BsBookmark, BsPlus, BsSearch } from "react-icons/bs";

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
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <BsBookmark className="h-5 w-5 text-[#d8e548] flex-shrink-0" />
          <h1 className="text-lg font-bold truncate">Bookmarks</h1>
          <span className="text-xs text-white font-light dark:bg-main-light bg-main-dark rounded-full px-1.5 py-0.5 flex-shrink-0">
            {bookmarksCount}
          </span>
        </div>
        <button
          onClick={onAddClick}
          className="flex items-center gap-1 bg-[#d8e548] hover:bg-[#c4d13a] text-main-dark px-2 py-1.5 rounded-lg transition-colors font-semibold text-sm flex-shrink-0"
        >
          <BsPlus className="h-3 w-3" />
          <span className="hidden sm:inline">Nuevo</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <BsSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
        <input
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-7 pr-3 py-1.5 border border-gray-300 dark:border-main-dark rounded-lg dark:bg-main-light dark:text-white bg-white shadow-md font-normal text-sm"
        />
      </div>
    </>
  );
};
