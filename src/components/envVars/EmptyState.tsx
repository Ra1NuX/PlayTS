import { KeyRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface EmptyStateProps {
  searchTerm: string;
  onAddClick: () => void;
}

export const EmptyState = ({ searchTerm, onAddClick }: EmptyStateProps) => {
  const { t } = useTranslation();

  if (searchTerm) {
    return (
      <div className="border-2 border-dashed rounded-lg p-8 dark:border-[#2a2a2a] border-gray-200 flex flex-col items-center justify-center text-center">
        <KeyRound className="h-8 w-8 dark:text-gray-500 text-gray-400 mb-3" />
        <p className="text-sm font-semibold dark:text-gray-100 text-gray-900 mb-1">
          {t('ENV_VAR_NOT_FOUND')}
        </p>
        <p className="text-xs dark:text-gray-500 text-gray-400">
          {t('TRY_DIFFERENT_SEARCH')}
        </p>
      </div>
    );
  }

  return (
    <div className="border-2 border-dashed rounded-lg p-8 dark:border-[#2a2a2a] border-gray-200 flex flex-col items-center justify-center text-center">
      <KeyRound className="h-8 w-8 dark:text-gray-500 text-gray-400 mb-3" />
      <p className="text-sm font-semibold dark:text-gray-100 text-gray-900 mb-1">
        {t('ENV_VAR_EMPTY_TITLE')}
      </p>
      <p className="text-xs dark:text-gray-500 text-gray-400 mb-3">
        {t('ENV_VAR_EMPTY_DESCRIPTION')}
      </p>
      <button
        onClick={onAddClick}
        className="h-9 px-4 rounded-lg bg-accent-dark hover:bg-accent-dark/90 text-white text-sm font-medium transition-colors cursor-pointer"
      >
        {t('ENV_VAR_CREATE_FIRST')}
      </button>
    </div>
  );
};
