import { BsKey } from 'react-icons/bs';
import { useTranslation } from 'react-i18next';

interface EmptyStateProps {
  searchTerm: string;
  onAddClick: () => void;
}

export const EmptyState = ({ searchTerm, onAddClick }: EmptyStateProps) => {
  const { t } = useTranslation();

  if (searchTerm) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <BsKey className="h-8 w-8 dark:text-gray-500 text-gray-400 mb-3" />
        <p className="text-sm font-semibold dark:text-gray-300 text-main-dark mb-1">
          {t('ENV_VAR_NOT_FOUND')}
        </p>
        <p className="text-xs dark:text-gray-500 text-gray-400">
          {t('TRY_DIFFERENT_SEARCH')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <BsKey className="h-8 w-8 dark:text-gray-500 text-gray-400 mb-3" />
      <p className="text-sm font-semibold dark:text-gray-300 text-main-dark mb-1">
        {t('ENV_VAR_EMPTY_TITLE')}
      </p>
      <p className="text-xs dark:text-gray-500 text-gray-400 mb-3">
        {t('ENV_VAR_EMPTY_DESCRIPTION')}
      </p>
      <button
        onClick={onAddClick}
        className="text-xs bg-accent-dark hover:bg-hover-ancient-dark text-main-dark px-3 py-1.5 rounded transition-colors font-semibold"
      >
        {t('ENV_VAR_CREATE_FIRST')}
      </button>
    </div>
  );
};
