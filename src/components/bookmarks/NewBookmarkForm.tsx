import { NewBookmark } from "../../utils/bookmarkUtils";
import { BookmarkForm } from "./BookmarkForm";
import { useTranslation } from "react-i18next";

interface NewBookmarkFormProps {
  bookmark: NewBookmark;
  onUpdate: (updates: Partial<NewBookmark>) => void;
  onUpdateTags: (tagsString: string) => void;
  onSave: () => void;
  onCancel: () => void;
  formatTags: (tags: string[]) => string;
}

export const NewBookmarkForm = ({
  bookmark,
  onUpdate,
  onUpdateTags,
  onSave,
  onCancel,
  formatTags
}: NewBookmarkFormProps) => {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border dark:border-[#2a2a2a] border-gray-200 dark:bg-[#1a1a1a] bg-white max-h-[80vh] flex flex-col">
      <div className="p-4 border-b dark:border-[#2a2a2a] border-gray-200">
        <h3 className="text-sm font-semibold dark:text-gray-100 text-gray-900">{t('NEW')} Bookmark</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
        <BookmarkForm
          values={bookmark}
          onUpdate={onUpdate}
          onUpdateTags={onUpdateTags}
          onSave={onSave}
          onCancel={onCancel}
          formatTags={formatTags}
          title={`${t('NEW')} Bookmark`}
        />
      </div>
    </div>
  );
};
