import { useState, DragEvent } from 'react';
import { CloudUpload } from 'lucide-react';
import { NewEnvVar } from '../../model/envVar';
import { useTranslation } from 'react-i18next';
import merge from '../../tools/merge';
import { parseEnvFileContent } from '../../utils/parseEnvFile';

interface NewEnvVarFormProps {
  onSave: (envVar: NewEnvVar) => void;
  onSaveMultiple: (envVars: NewEnvVar[]) => void;
  onCancel: () => void;
}

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
    <div className="dark:bg-[#1a1a1a] bg-white rounded-lg border dark:border-[#2a2a2a] border-gray-200 flex flex-col">
      <div className="p-4 border-b dark:border-[#2a2a2a] border-gray-200">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider dark:text-gray-400 text-gray-500">
          {t('ENV_VAR_NEW')}
        </h3>
      </div>

      <div className="p-4 space-y-3">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={merge(
            'border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer',
            isDragging
              ? 'border-accent-dark bg-accent-dark/10'
              : 'dark:border-[#2a2a2a] border-gray-200 hover:border-accent-dark dark:hover:border-accent-dark'
          )}
        >
          <CloudUpload className="h-5 w-5 dark:text-gray-500 text-gray-400" />
          <p className="text-xs dark:text-gray-500 text-gray-400 text-center">
            {t('ENV_VAR_DROP_ENV_FILE')}
          </p>
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5 dark:text-gray-400 text-gray-500">
            {t('ENV_VAR_KEY')}
          </label>
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full h-9 px-3 text-sm rounded-lg border dark:bg-[#111] bg-gray-50 dark:border-[#2a2a2a] border-gray-200 dark:text-gray-100 text-gray-900 focus:ring-2 focus:ring-accent-dark/30 focus:border-accent-dark outline-none transition-colors font-mono"
            placeholder="MY_API_KEY"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5 dark:text-gray-400 text-gray-500">
            {t('ENV_VAR_VALUE')}
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full h-9 px-3 text-sm rounded-lg border dark:bg-[#111] bg-gray-50 dark:border-[#2a2a2a] border-gray-200 dark:text-gray-100 text-gray-900 focus:ring-2 focus:ring-accent-dark/30 focus:border-accent-dark outline-none transition-colors font-mono"
            placeholder="my-secret-value"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="rounded text-accent-dark focus:ring-accent-dark/30 cursor-pointer"
          />
          <span className="text-xs dark:text-gray-400 text-gray-500">
            {t('ENV_VAR_ACTIVE_ON_CREATE')}
          </span>
        </label>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!key.trim() || !value.trim()}
            className="h-9 px-4 rounded-lg bg-accent-dark hover:bg-accent-dark/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors cursor-pointer flex-1"
          >
            {t('SAVE')}
          </button>
          <button
            onClick={onCancel}
            className="h-9 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] dark:text-gray-400 text-gray-500 border dark:border-[#2a2a2a] border-gray-200 text-sm font-medium transition-colors cursor-pointer flex-1"
          >
            {t('CANCEL')}
          </button>
        </div>
      </div>
    </div>
  );
};
