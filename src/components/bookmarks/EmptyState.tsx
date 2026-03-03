import { BsBookmarkFill } from "react-icons/bs";
import { useTranslation } from "react-i18next";

interface EmptyStateProps {
  searchTerm: string;
  onAddClick: () => void;
}

export const EmptyState = ({ searchTerm, onAddClick }: EmptyStateProps) => {
  const { t } = useTranslation();

  return (
    <div className="dark:bg-main-light bg-white rounded-lg border border-gray-200 dark:border-main-dark p-6 text-center shadow-md">
      <BsBookmarkFill className="h-12 w-12 dark:text-gray-300 text-gray-400 mx-auto mb-3" />
      <h3 className="text-base font-medium dark:text-white text-main-dark mb-2">
        {searchTerm ? t('NO_BOOKMARKS_FOUND') : t('NO_BOOKMARKS_SAVED')}
      </h3>
      <p className="dark:text-white text-main-light/60 mb-4 text-sm">
        {searchTerm
          ? t('TRY_DIFFERENT_SEARCH')
          : t('SAVE_FAVORITE_FUNCTIONS')
        }
      </p>
      {!searchTerm && (
        <button
          onClick={onAddClick}
          className="bg-accent-dark hover:bg-hover-ancient-dark text-main-dark dark:text-white px-4 py-2 rounded-lg transition-colors font-semibold text-sm"
        >
{t('CREATE_FIRST_BOOKMARK')}
        </button>
      )}
    </div>
  );
};
