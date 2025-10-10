import { BsSearch } from "react-icons/bs";

interface DependenciesHeaderProps {
  installedCount: number;
  onSearchChange: (term: string) => void;
}

export const DependenciesHeader = ({ 
  installedCount, 
  onSearchChange 
}: DependenciesHeaderProps) => {
  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <h1 className="text-lg ml-1.5 font-bold truncate text-white">Dependencies</h1>
          <span className="text-xs text-white font-light dark:bg-main-light bg-main-dark rounded-full px-1.5 py-0.5 flex-shrink-0">
            {installedCount}
          </span>
        </div>
      </div>

      <div className="relative">
        <BsSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
        <input
          type="search"
          placeholder="Buscar paquetes npm..."
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-7 pr-3 py-1.5 border border-gray-300 dark:border-divider-dark rounded-lg dark:bg-main-light dark:text-white bg-white font-normal text-sm"
        />
      </div>
    </>
  );
};

