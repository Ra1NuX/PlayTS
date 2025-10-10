import { BiSolidPackage } from "react-icons/bi";
import { BsSearch } from "react-icons/bs";

interface EmptyStateProps {
  hasSearch: boolean;
}

export const EmptyState = ({ hasSearch }: EmptyStateProps) => {
  return (
    <div className="dark:bg-main-light bg-white rounded-lg border-2 border-dashed border-gray-300 dark:border-main-dark p-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-main-dark flex items-center justify-center">
          {hasSearch ? (
            <BsSearch className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          ) : (
            <BiSolidPackage className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          )}
        </div>
      </div>
      
      <h3 className="text-base font-semibold dark:text-white text-main-dark mb-2">
        {hasSearch ? 'No se encontraron paquetes' : 'No hay dependencias instaladas'}
      </h3>
      
      <p className="dark:text-gray-400 text-main-light/70 text-sm max-w-xs mx-auto leading-relaxed">
        {hasSearch 
          ? 'Intenta con otros términos de búsqueda o verifica la ortografía' 
          : 'Busca e instala paquetes npm para comenzar a usarlos en tu proyecto'
        }
      </p>
    </div>
  );
};

