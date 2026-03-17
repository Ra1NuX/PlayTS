import { useTranslation } from "react-i18next";
import { MiniCodeEditor } from "./MiniCodeEditor";

export interface BookmarkFormValues {
  name: string;
  code: string;
  language: string;
  description: string;
  tags: string[];
  isGloballyActive: boolean;
}

interface BookmarkFormProps {
  values: BookmarkFormValues;
  onUpdate: (updates: Partial<BookmarkFormValues>) => void;
  onUpdateTags: (tagsString: string) => void;
  onSave: () => void;
  onCancel: () => void;
  formatTags: (tags: string[]) => string;
  title: string;
  submitLabel?: string;
}

export const BookmarkForm = ({
  values,
  onUpdate,
  onUpdateTags,
  onSave,
  onCancel,
  formatTags,
  title,
  submitLabel,
}: BookmarkFormProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider dark:text-gray-400 text-gray-500">{t('NAME')}</label>
        <input
          type="text"
          value={values.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="w-full h-9 px-3 text-sm rounded-lg border dark:bg-[#111] bg-gray-50 dark:border-[#2a2a2a] border-gray-200 dark:text-gray-100 text-gray-900 focus:ring-2 focus:ring-accent-dark/30 focus:border-accent-dark outline-none transition-colors"
          placeholder={t('NAME')}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-semibold uppercase tracking-wider dark:text-gray-400 text-gray-500">{t('LANGUAGE')}</label>
          <select
            value={values.language}
            onChange={(e) => onUpdate({ language: e.target.value })}
            className="w-full h-9 px-3 text-sm rounded-lg border dark:bg-[#111] bg-gray-50 dark:border-[#2a2a2a] border-gray-200 dark:text-gray-100 text-gray-900 focus:ring-2 focus:ring-accent-dark/30 focus:border-accent-dark outline-none transition-colors cursor-pointer"
          >
            <option value="javascript">{t('JS')}</option>
            <option value="typescript">{t('TS')}</option>
          </select>
        </div>
        <div className="flex items-end justify-center pb-1.5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={values.isGloballyActive}
              onChange={(e) => onUpdate({ isGloballyActive: e.target.checked })}
              className="rounded text-accent-dark focus:ring-accent-dark/30 cursor-pointer"
            />
            <span className="text-sm dark:text-gray-400 text-gray-500">{t('GLOBAL')}</span>
          </label>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider dark:text-gray-400 text-gray-500">{t('DESCRIPTION')}</label>
        <input
          type="text"
          value={values.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          className="w-full h-9 px-3 text-sm rounded-lg border dark:bg-[#111] bg-gray-50 dark:border-[#2a2a2a] border-gray-200 dark:text-gray-100 text-gray-900 focus:ring-2 focus:ring-accent-dark/30 focus:border-accent-dark outline-none transition-colors"
          placeholder={t('DESCRIPTION')}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider dark:text-gray-400 text-gray-500">{t('CODE')}</label>
        <MiniCodeEditor
          value={values.code}
          onChange={(code) => onUpdate({ code })}
          language={values.language}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider dark:text-gray-400 text-gray-500">{t('TAGS')}</label>
        <input
          type="text"
          value={formatTags(values.tags)}
          onChange={(e) => onUpdateTags(e.target.value)}
          className="w-full h-9 px-3 text-sm rounded-lg border dark:bg-[#111] bg-gray-50 dark:border-[#2a2a2a] border-gray-200 dark:text-gray-100 text-gray-900 focus:ring-2 focus:ring-accent-dark/30 focus:border-accent-dark outline-none transition-colors"
          placeholder={t('TAGS_PLACEHOLDER')}
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={onSave}
          className="h-9 px-4 rounded-lg bg-accent-dark hover:bg-accent-dark/90 text-white text-sm font-medium transition-colors cursor-pointer flex-1"
        >
          {submitLabel || t('SAVE')}
        </button>
        <button
          onClick={onCancel}
          className="h-9 px-4 rounded-lg border dark:border-[#2a2a2a] border-gray-200 dark:text-gray-400 text-gray-500 hover:dark:bg-[#2a2a2a] hover:bg-gray-100 text-sm font-medium transition-colors cursor-pointer flex-1"
        >
          {t('CANCEL')}
        </button>
      </div>
    </div>
  );
};
