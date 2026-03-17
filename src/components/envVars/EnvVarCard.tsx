import { useState, useRef, useEffect } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems, Switch } from '@headlessui/react';
import { Eye, MoreVertical, Pencil, Trash2 } from 'lucide-react';
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

  const maskedValue = '\u2022'.repeat(Math.min(envVar.value.length, 12));

  return (
    <div className="p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-accent-dark font-medium truncate">
              {envVar.key}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-1">
            <span className={merge(
              "text-xs font-mono truncate",
              revealed ? "dark:text-gray-100 text-gray-900" : "font-mono dark:text-gray-500 text-gray-400"
            )}>
              {revealed ? envVar.value : maskedValue}
            </span>
            <button
              onClick={handleReveal}
              className="flex-shrink-0 dark:text-gray-500 text-gray-400 hover:dark:text-gray-300 hover:text-gray-600 transition-colors cursor-pointer"
              title={t('ENV_VAR_REVEAL')}
            >
              <Eye className="h-3 w-3" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <Switch
            checked={envVar.isActive}
            onChange={() => onToggleActive(envVar.id)}
            className={`${
              envVar.isActive ? 'bg-accent-dark' : 'bg-gray-200 dark:bg-[#2a2a2a]'
            } relative inline-flex flex-col px-0.5 items-center h-4 w-7 justify-center rounded-full transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent-dark/30`}
          >
            <span
              className={`${
                envVar.isActive ? 'self-end' : 'self-start'
              } inline-block h-3 w-3 rounded-full bg-white transition-all`}
            />
          </Switch>

          <Menu as="div" className="relative">
            <MenuButton className="flex items-center justify-center w-6 h-6 rounded-lg dark:text-gray-400 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors cursor-pointer">
              <MoreVertical className="h-3.5 w-3.5" />
            </MenuButton>

            <MenuItems anchor="bottom end" className="z-50 w-44 dark:bg-[#1a1a1a] bg-white border dark:border-[#2a2a2a] border-gray-200 rounded-lg shadow-lg focus:outline-none overflow-hidden">
              <div className="py-1">
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => onEdit(envVar)}
                      className={merge(
                        'flex items-center gap-2 w-full px-3 py-1.5 text-xs transition-colors cursor-pointer',
                        active
                          ? 'dark:bg-[#2a2a2a] bg-gray-100 dark:text-gray-100 text-gray-900'
                          : 'dark:text-gray-400 text-gray-500'
                      )}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      {t('EDIT')}
                    </button>
                  )}
                </MenuItem>

                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => onDelete(envVar.id)}
                      className={merge(
                        'flex items-center gap-2 w-full px-3 py-1.5 text-xs transition-colors cursor-pointer',
                        active
                          ? 'bg-red-500/10 text-red-400'
                          : 'text-red-500'
                      )}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
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
