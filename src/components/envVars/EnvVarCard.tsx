import { useState, useRef, useEffect } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems, Switch } from '@headlessui/react';
import { BsEye, BsThreeDotsVertical, BsPencil, BsTrash } from 'react-icons/bs';
import { EnvVar } from '../../model/envVar';
import { useTranslation } from 'react-i18next';
import merge from '../../tools/merge';

interface EnvVarCardProps {
  envVar: EnvVar;
  onDelete: (id: string) => void;
  onEdit: (envVar: EnvVar) => void;
  onToggleActive: (id: string) => void;
}

const REVEAL_DURATION_MS = 3000;

export const EnvVarCard = ({ envVar, onDelete, onEdit, onToggleActive }: EnvVarCardProps) => {
  const { t } = useTranslation();
  const [revealed, setRevealed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleReveal = () => {
    setRevealed(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setRevealed(false), REVEAL_DURATION_MS);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const maskedValue = '•'.repeat(Math.min(envVar.value.length, 12));

  return (
    <div className="p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-semibold dark:text-accent-dark text-accent-dark truncate">
              {envVar.key}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs font-mono dark:text-gray-300 text-gray-600 truncate">
              {revealed ? envVar.value : maskedValue}
            </span>
            <button
              onClick={handleReveal}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              title={t('ENV_VAR_REVEAL')}
            >
              <BsEye className="h-3 w-3" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <Switch
            checked={envVar.isActive}
            onChange={() => onToggleActive(envVar.id)}
            className={`${
              envVar.isActive ? 'bg-accent-dark' : 'bg-gray-200 dark:bg-main-dark'
            } relative inline-flex flex-col px-0.5 items-center h-4 w-7 justify-center rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-accent-dark focus:ring-offset-1`}
          >
            <span
              className={`${
                envVar.isActive ? 'self-end' : 'self-start'
              } inline-block h-3 w-3 rounded-full bg-white transition-all`}
            />
          </Switch>

          <Menu as="div" className="relative">
            <MenuButton className="flex items-center justify-center w-6 h-6 rounded dark:text-gray-400 text-gray-500 dark:hover:text-gray-200 hover:text-gray-700 transition-colors">
              <BsThreeDotsVertical className="h-3.5 w-3.5" />
            </MenuButton>

            <MenuItems anchor="bottom end" className="z-50 w-44 dark:bg-main-light bg-white border border-gray-200 dark:border-divider-dark rounded shadow-lg focus:outline-none">
              <div className="py-1">
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => onEdit(envVar)}
                      className={merge(
                        'flex items-center gap-2 w-full px-3 py-1.5 text-xs transition-colors',
                        active
                          ? 'dark:bg-main-dark bg-gray-100 dark:text-white text-main-dark'
                          : 'dark:text-gray-300 text-gray-600'
                      )}
                    >
                      <BsPencil className="h-3.5 w-3.5" />
                      {t('EDIT')}
                    </button>
                  )}
                </MenuItem>

                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => onDelete(envVar.id)}
                      className={merge(
                        'flex items-center gap-2 w-full px-3 py-1.5 text-xs transition-colors',
                        active
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                          : 'text-red-500 dark:text-red-400'
                      )}
                    >
                      <BsTrash className="h-3.5 w-3.5" />
                      {t('DELETE')}
                    </button>
                  )}
                </MenuItem>
              </div>
            </MenuItems>
          </Menu>
        </div>
      </div>
    </div>
  );
};
