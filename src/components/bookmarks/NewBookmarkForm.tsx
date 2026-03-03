import { NewBookmark } from "../../utils/bookmarkUtils";
import { MiniCodeEditor } from "./MiniCodeEditor";
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
    <div className="dark:bg-main-light bg-white rounded-lg border border-gray-200 dark:border-divider-dark max-h-[80vh] flex flex-col">
      <div className="p-3 border-b dark:border-divider-dark border-gray-200">
        <h3 className="text-base font-semibold dark:text-white text-main-dark">{t('NEW')} Bookmark</h3>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 p-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
        <div>
          <label className="block text-xs font-medium mb-1 dark:text-gray-300 text-main-dark">{t('NAME')}</label>
          <input
            type="text"
            value={bookmark.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="w-full px-2 py-1.5 border border-gray-300 dark:border-divider-dark rounded-lg dark:bg-main-dark dark:text-white bg-white  font-normal text-sm"
            placeholder={t('NAME')}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium mb-1 dark:text-gray-300 text-main-dark">{t('LANGUAGE')}</label>
            <select
              value={bookmark.language}
              onChange={(e) => onUpdate({ language: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 dark:border-divider-dark rounded-lg dark:bg-main-dark dark:text-white bg-white  font-normal text-sm"
            >
              <option value="javascript">{t('JS')}</option>
              <option value="typescript">{t('TS')}</option>
            </select>
          </div>
          <div className="flex items-center justify-center">
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={bookmark.isGloballyActive}
                onChange={(e) => onUpdate({ isGloballyActive: e.target.checked })}
                className="rounded text-xs"
              />
              <span className="text-xs dark:text-gray-300 text-main-dark">{t('GLOBAL')}</span>
            </label>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 dark:text-gray-300 text-main-dark">{t('DESCRIPTION')}</label>
          <input
            type="text"
            value={bookmark.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            className="w-full px-2 py-1.5 border border-gray-300 dark:border-divider-dark rounded-lg dark:bg-main-dark dark:text-white bg-white  font-normal text-sm"
            placeholder={t('DESCRIPTION')}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 dark:text-gray-300 text-main-dark">{t('CODE')}</label>
          <MiniCodeEditor
            value={bookmark.code}
            onChange={(code) => onUpdate({ code })}
            language={bookmark.language}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 dark:text-gray-300 text-main-dark">{t('TAGS')}</label>
          <input
            type="text"
            value={formatTags(bookmark.tags)}
            onChange={(e) => onUpdateTags(e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-300 dark:border-divider-dark rounded-lg dark:bg-main-dark dark:text-white bg-white  font-normal text-sm"
            placeholder={t('TAGS_PLACEHOLDER')}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={onSave}
            className="bg-accent-dark hover:bg-hover-ancient-dark text-main-dark px-3 py-1.5 rounded-lg transition-colors font-semibold text-sm flex-1"
          >
{t('SAVE')}
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg transition-colors font-semibold text-sm flex-1"
          >
{t('CANCEL')}
          </button>
        </div>
      </div>
    </div>
  );
};
