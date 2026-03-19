import { Switch } from "@headlessui/react";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from 'react-i18next';

const SwitchTheme = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <div className="flex flex-row gap-5 justify-between items-center dark:text-gray-100 text-gray-900 text-sm">
      {t('THEME')}
      <Switch
        checked={theme === "dark"}
        onChange={toggleTheme}
        className="group inline-flex h-7 w-12 items-center rounded-lg border dark:border-[#2a2a2a] border-gray-200 transition-colors data-[checked]:bg-accent-dark dark:bg-[#111] bg-gray-50 cursor-pointer"
      >
        <span className="size-4 translate-x-1 rounded-full bg-transparent transition-all duration-200 group-data-[checked]:translate-x-[26px]">
          {theme === "dark" ? (
            <Moon className="w-4 h-4 text-white" />
          ) : (
            <Sun className="w-4 h-4 text-yellow-600" />
          )}
        </span>
      </Switch>
    </div>
  );
};

export default SwitchTheme;
