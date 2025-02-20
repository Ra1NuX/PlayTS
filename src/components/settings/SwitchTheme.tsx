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
        className="group inline-flex h-7 w-12 border border-main-dark/20 items-center rounded-xl transition-transform data-[checked]:bg-main-dark/50 hover:data-[checked]:bg-main-dark bg-[#fafafa] shadow-md"
      >
        <span className="size-4 translate-x-1 rounded-full bg-transparent transition-transform group-data-[checked]:translate-x-[26px]">
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
