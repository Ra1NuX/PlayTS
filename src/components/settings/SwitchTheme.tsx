import { Switch } from "@headlessui/react";

import { BiSolidMoon, BiSun } from "react-icons/bi";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from 'react-i18next';

const SwitchTheme = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-row gap-5 justify-between">
      {t('THEME')}
      <Switch
        checked={theme === "dark"}
        onChange={toggleTheme}
        className="group inline-flex h-6 w-11 items-center rounded-full transition-transform data-[checked]:bg-main-dark bg-[#fafafa] shadow-md"
      >
        <span className="size-4 translate-x-1 rounded-full bg-white dark:bg-main-dark transition-transform group-data-[checked]:translate-x-6">
          {theme === "dark" ? (
            <BiSolidMoon className="text-white" />
          ) : (
            <BiSun className="text-yellow-600" />
          )}
        </span>
      </Switch>
    </div>
  );
};

export default SwitchTheme;
