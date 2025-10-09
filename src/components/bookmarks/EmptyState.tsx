import { BsBookmarkFill } from "react-icons/bs";

interface EmptyStateProps {
  searchTerm: string;
  onAddClick: () => void;
}

export const EmptyState = ({ searchTerm, onAddClick }: EmptyStateProps) => {
  return (
    <div className="dark:bg-main-light bg-white rounded-lg border border-gray-200 dark:border-main-dark p-6 text-center shadow-md">
      <BsBookmarkFill className="h-12 w-12 text-gray-400 mx-auto mb-3" />
      <h3 className="text-base font-medium dark:text-white text-main-dark mb-2">
        {searchTerm ? 'No se encontraron bookmarks' : 'No hay bookmarks guardados'}
      </h3>
      <p className="dark:text-gray-400 text-main-light/60 mb-4 text-sm">
        {searchTerm 
          ? 'Intenta con otros términos de búsqueda' 
          : 'Guarda tus funciones favoritas para acceder a ellas rápidamente'
        }
      </p>
      {!searchTerm && (
        <button
          onClick={onAddClick}
          className="bg-[#d8e548] hover:bg-[#c4d13a] text-main-dark px-4 py-2 rounded-lg transition-colors font-semibold text-sm"
        >
          Crear tu primer bookmark
        </button>
      )}
    </div>
  );
};
