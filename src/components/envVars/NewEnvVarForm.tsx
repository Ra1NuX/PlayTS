import { useState, DragEvent } from 'react';
import { BsCloudUpload } from 'react-icons/bs';
import { NewEnvVar } from '../../model/envVar';
import { useTranslation } from 'react-i18next';
import merge from '../../tools/merge';

interface NewEnvVarFormProps {
  onSave: (envVar: NewEnvVar) => void;
  onSaveMultiple: (envVars: NewEnvVar[]) => void;
  onCancel: () => void;
}

const parseEnvFileContent = (content: string): NewEnvVar[] => {
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const eqIndex = line.indexOf('=');
      const key = line.slice(0, eqIndex).trim();
      const value = line.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, '');
      return { key, value, isActive: true };
    })
    .filter((ev) => ev.key.length > 0);
};

export const NewEnvVarForm = ({ onSave, onSaveMultiple, onCancel }: NewEnvVarFormProps) => {
  const { t } = useTranslation();
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const handleSave = () => {
    if (!key.trim() || !value.trim()) return;
    onSave({ key: key.trim(), value: value.trim(), isActive });
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content !== 'string') return;
      const parsed = parseEnvFileContent(content);
      if (parsed.length > 0) {
        onSaveMultiple(parsed);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="dark:bg-main-light bg-white rounded border border-gray-200 dark:border-divider-dark flex flex-col">
      <div className="p-3 border-b dark:border-divider-dark border-gray-200">
        <h3 className="text-base font-semibold dark:text-white text-main-dark">
          {t('ENV_VAR_NEW')}
        </h3>
      </div>

      <div className="p-3 space-y-3">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={merge(
            'border-2 border-dashed rounded p-4 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer',
            isDragging
              ? 'border-accent-dark bg-accent-dark/10'
              : 'border-gray-300 dark:border-divider-dark hover:border-accent-dark dark:hover:border-accent-dark'
          )}
        >
          <BsCloudUpload className="h-5 w-5 dark:text-gray-400 text-gray-400" />
          <p className="text-xs dark:text-gray-400 text-gray-500 text-center">
            {t('ENV_VAR_DROP_ENV_FILE')}
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1 dark:text-gray-300 text-main-dark">
            {t('ENV_VAR_KEY')}
          </label>
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-300 dark:border-divider-dark rounded dark:bg-main-dark dark:text-white bg-white font-mono font-normal text-sm"
            placeholder="MY_API_KEY"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1 dark:text-gray-300 text-main-dark">
            {t('ENV_VAR_VALUE')}
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-300 dark:border-divider-dark rounded dark:bg-main-dark dark:text-white bg-white font-mono font-normal text-sm"
            placeholder="my-secret-value"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="rounded text-xs"
          />
          <span className="text-xs dark:text-gray-300 text-main-dark">
            {t('ENV_VAR_ACTIVE_ON_CREATE')}
          </span>
        </label>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!key.trim() || !value.trim()}
            className="bg-accent-dark hover:bg-hover-ancient-dark disabled:opacity-50 disabled:cursor-not-allowed text-main-dark px-3 py-1.5 rounded transition-colors font-semibold text-sm flex-1"
          >
            {t('SAVE')}
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded transition-colors font-semibold text-sm flex-1"
          >
            {t('CANCEL')}
          </button>
        </div>
      </div>
    </div>
  );
};
