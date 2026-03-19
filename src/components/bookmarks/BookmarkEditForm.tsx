import { Check, X } from "lucide-react";
import { Bookmark } from "../../utils/bookmarkUtils";
import { BookmarkForm } from "./BookmarkForm";
import { useTranslation } from "react-i18next";

interface BookmarkEditFormProps {
  bookmark: Bookmark;
  onSave: () => void;
  onCancel: () => void;
  onUpdate: (updates: Partial<Bookmark>) => void;
  onUpdateTags: (tagsString: string) => void;
  formatTags: (tags: string[]) => string;
}

export const BookmarkEditForm = ({
  bookmark,
  onSave,
  onCancel,
  onUpdate,
  onUpdateTags,
  formatTags
}: BookmarkEditFormProps) => {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border dark:border-[#2a2a2a] border-gray-200 dark:bg-[#1a1a1a] bg-white p-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold dark:text-gray-100 text-gray-900">{t('EDITING')} {bookmark.name}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={onSave}
              className="h-9 px-4 rounded-lg bg-accent-dark hover:bg-accent-dark/90 text-white text-sm font-medium transition-colors cursor-pointer flex items-center gap-1"
              title={t('SAVE')}
            >
              <Check className="h-4 w-4" />
              <span className="hidden sm:inline">{t('SAVE')}</span>
            </button>
            <button
              onClick={onCancel}
              className="h-9 px-4 rounded-lg border dark:border-[#2a2a2a] border-gray-200 dark:text-gray-400 text-gray-500 hover:dark:bg-[#2a2a2a] hover:bg-gray-100 text-sm font-medium transition-colors cursor-pointer flex items-center gap-1"
              title={t('CANCEL')}
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">{t('CANCEL')}</span>
            </button>
          </div>
        </div>

        <BookmarkForm
          values={bookmark}
          onUpdate={onUpdate}
          onUpdateTags={onUpdateTags}
          onSave={onSave}
          onCancel={onCancel}
          formatTags={formatTags}
          title={`${t('EDITING')} ${bookmark.name}`}
        />
      </div>
    </div>
  );
};
