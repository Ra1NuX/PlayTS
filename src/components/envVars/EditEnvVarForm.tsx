import { useState } from 'react';
import { EnvVar } from '../../model/envVar';
import { useTranslation } from 'react-i18next';

interface EditEnvVarFormProps {
  envVar: EnvVar;
  onSave: (id: string, updates: Partial<EnvVar>) => void;
  onCancel: () => void;
}

export const EditEnvVarForm = ({ envVar, onSave, onCancel }: EditEnvVarFormProps) => {
  const { t } = useTranslation();
  const [key, setKey] = useState(envVar.key);
  const [value, setValue] = useState(envVar.value);

  const handleSave = () => {
    if (!key.trim() || !value.trim()) return;
    onSave(envVar.id, { key: key.trim(), value: value.trim() });
  };

  return (
    <div className="p-3 space-y-3">
      <h3 className="text-sm font-semibold dark:text-white text-main-dark border-b dark:border-divider-dark border-gray-200 pb-2">
        {t('EDITING')} <span className="font-mono text-accent-dark">{envVar.key}</span>
      </h3>

      <div>
        <label className="block text-xs font-medium mb-1 dark:text-gray-300 text-main-dark">
          {t('ENV_VAR_KEY')}
        </label>
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="w-full px-2 py-1.5 border border-gray-300 dark:border-divider-dark rounded dark:bg-main-dark dark:text-white bg-white font-mono font-normal text-sm"
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
        />
      </div>

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
  );
};
