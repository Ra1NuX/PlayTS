import { useTranslation } from "react-i18next";
import { BiSolidHelpCircle } from "react-icons/bi";
import { FaPalette, FaUserEdit } from "react-icons/fa";
import { BsStars } from "react-icons/bs";

import useSettings from "./hooks/useSettings";
import { SidebarSection } from "./components/SidebarSection";
import SwitchTheme from "./components/settings/SwitchTheme";
import LanguageSelector from "./components/settings/LanguageSelector";
import SocialMedias from "./components/settings/SocialMedias";
import FontSelector from "./components/settings/FontSelector";
import FontSizeSelector from "./components/settings/FontSizeSelector";
import AppInfo from "./components/settings/AppInfo";
import ApiKey from "./components/settings/ApiKey";
import AIModelSelector from "./components/settings/AIModelSelector";
import UsernameInput from "./components/settings/UsernameInput";
import EmailInput from "./components/settings/EmailInput";

const Settings = () => {
  const { t } = useTranslation();
  const { settings } = useSettings();

  return (
    <SidebarSection title={t("SETTINGS")}>
      <div className="flex flex-col gap-6 pb-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 px-1">
            <FaUserEdit className="w-3.5 h-3.5 dark:text-gray-400 text-gray-500" />
            <h2 className="text-xs font-semibold dark:text-gray-400 text-main-light/60 uppercase tracking-wide">
              {t("GENERAL")}
            </h2>
          </div>
          <div className="flex flex-col gap-2">
            <UsernameInput />
            <EmailInput />
          </div>
        </div>

        <div className="w-full h-px dark:bg-divider-dark bg-gray-200" />

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 px-1">
            <FaPalette className="w-3.5 h-3.5 dark:text-gray-400 text-gray-500" />
            <h2 className="text-xs font-semibold dark:text-gray-400 text-main-light/60 uppercase tracking-wide">
              {t("APPARENCE")}
            </h2>
          </div>
          <div className="flex flex-col gap-2">
            <SwitchTheme />
            <FontSelector />
            <FontSizeSelector />
            <LanguageSelector />
          </div>
        </div>

        <div className="w-full h-px dark:bg-divider-dark bg-gray-200" />

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 px-1">
            <BsStars className="w-3.5 h-3.5 dark:text-gray-400 text-gray-500" />
            <h2 className="text-xs font-semibold dark:text-gray-400 text-main-light/60 uppercase tracking-wide">
              {t("AI_OPENAI")}
            </h2>
          </div>
          <div className="flex flex-col gap-2">
            <ApiKey />
            {settings.apiKey ? <AIModelSelector /> : null}
          </div>
        </div>

        <div className="w-full h-px dark:bg-divider-dark bg-gray-200" />

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 px-1">
            <BiSolidHelpCircle className="w-3.5 h-3.5 dark:text-gray-400 text-gray-500" />
            <h2 className="text-xs font-semibold dark:text-gray-400 text-main-light/60 uppercase tracking-wide">
              {t("ABOUT")}
            </h2>
          </div>
          <div className="flex flex-col gap-2">
            <AppInfo />
            <SocialMedias />
          </div>
        </div>
      </div>
    </SidebarSection>
  );
};

export default Settings;
