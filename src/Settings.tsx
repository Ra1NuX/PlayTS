import { useTranslation } from "react-i18next";
import { HelpCircle, Palette, UserPen, Sparkles } from "lucide-react";

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
import AccountSection from "./components/auth/AccountSection";
import { useAuthStore } from "./stores/authStore";

const Settings = () => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { isAuthenticated } = useAuthStore();

  return (
    <SidebarSection title={t("SETTINGS")}>
      <div className="w-full flex-1 flex flex-col gap-4">
        <AccountSection />

        <div className="h-px dark:bg-[#2a2a2a] bg-gray-100" />

        {!isAuthenticated && (
          <>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 px-1">
                <UserPen className="w-3.5 h-3.5 dark:text-gray-400 text-gray-500" />
                <h2 className="text-[11px] font-semibold uppercase tracking-wider dark:text-gray-400 text-gray-500">
                  {t("GENERAL")}
                </h2>
              </div>
              <div className="flex flex-col gap-2">
                <UsernameInput />
                <EmailInput />
              </div>
            </div>
            <div className="h-px dark:bg-[#2a2a2a] bg-gray-100" />
          </>
        )}

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 px-1">
            <Palette className="w-3.5 h-3.5 dark:text-gray-400 text-gray-500" />
            <h2 className="text-[11px] font-semibold uppercase tracking-wider dark:text-gray-400 text-gray-500">
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

        <div className="h-px dark:bg-[#2a2a2a] bg-gray-100" />

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 px-1">
            <Sparkles className="w-3.5 h-3.5 dark:text-gray-400 text-gray-500" />
            <h2 className="text-[11px] font-semibold uppercase tracking-wider dark:text-gray-400 text-gray-500">
              {t("AI_OPENAI")}
            </h2>
          </div>
          <div className="flex flex-col gap-2">
            <ApiKey />
            {settings.apiKey ? <AIModelSelector /> : null}
          </div>
        </div>

        <div className="h-px dark:bg-[#2a2a2a] bg-gray-100" />

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 px-1">
            <HelpCircle className="w-3.5 h-3.5 dark:text-gray-400 text-gray-500" />
            <h2 className="text-[11px] font-semibold uppercase tracking-wider dark:text-gray-400 text-gray-500">
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
