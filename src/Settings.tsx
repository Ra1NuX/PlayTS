import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { BiSolidHelpCircle } from "react-icons/bi";
import { FaPalette } from "react-icons/fa";

import SwitchTheme from "./components/settings/SwitchTheme";
import LanguageSelector from "./components/settings/LanguageSelector";
import SocialMedias from "./components/settings/SocialMedias";
import FontSelector from "./components/settings/FontSelector";
import FontSizeSelector from "./components/settings/FontSizeSelector";
import AppInfo from "./components/settings/AppInfo";
import ApiKey from "./components/settings/ApiKey";
import { BsStars } from "react-icons/bs";
import { FaUserEdit } from "react-icons/fa";
import AIModelSelector from "./components/settings/AIModelSelector";
import UsernameInput from "./components/settings/UsernameInput";
import EmailInput from "./components/settings/EmailInput";
import { useTranslation } from "react-i18next";

interface SettingsProps {
  open?: () => void;
  close?: () => void;
}

const Settings = ({ close = Function, }: SettingsProps) => {

  const { t } = useTranslation();

  return (
    <main className="flex flex-col font-[roboto] font-medium text-main-dark dark:text-white">
      <TabGroup>
        <nav className="flex justify-between p-1">
          <TabList className="flex gap-1 p-0.5 bg-main-light/10 dark:bg-white/5 rounded-md shadow-md">
            <Tab className="flex gap-2 items-center justify-center rounded-md  p-0.5 px-2 focus:outline-none data-[selected]:bg-white/10 data-[hover]:bg-white/5 data-[selected]:data-[hover]:bg-white/10 data-[focus]:outline-1 data-[focus]:outline-white">
              <FaUserEdit className="w-4 h-4" />
              {t("GENERAL")}
            </Tab>
            <Tab className="flex gap-2 items-center justify-center rounded-md  p-1 px-2 focus:outline-none data-[selected]:bg-white/10 data-[hover]:bg-white/5 data-[selected]:data-[hover]:bg-white/10 data-[focus]:outline-1 data-[focus]:outline-white">
              <FaPalette className="w-4 h-4" />
              {t("APPARENCE")}
            </Tab>
            <Tab className="flex gap-2 items-center justify-center rounded-md  p-1 px-2 focus:outline-none data-[selected]:bg-white/10 data-[hover]:bg-white/5 data-[selected]:data-[hover]:bg-white/10 data-[focus]:outline-1 data-[focus]:outline-white">
              <BsStars className="w-4 h-4" />
              {t("AI")}
            </Tab>
            <Tab className="flex gap-2 items-center justify-center rounded-md  p-1 px-2 focus:outline-none data-[selected]:bg-white/10 data-[hover]:bg-white/5 data-[selected]:data-[hover]:bg-white/10 data-[focus]:outline-1 data-[focus]:outline-white">
              <BiSolidHelpCircle className="w-4 h-4" />
              {t("ABOUT")}
            </Tab>
          </TabList>
          <button
            onClick={() => close()}
            className="flex justify-center aspect-square w-9 h-9 ml-1.5 items-center rounded hover:bg-[#ff0000dd] dark:hover:bg-[#ff0000dd] hover:text-white"
          >
            <span className="text-2xl font-extralight mb-1.5">&times;</span>
          </button>
        </nav>
        <TabPanels className="p-4">
          <TabPanel className="flex flex-col gap-2">
            <UsernameInput />
            <EmailInput />
            {/* <div className="flex justify-between items-center pt-2">
              <button className="hover:bg-red-500 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 ease-in-out">
                <span>Reset Settings</span>
              </button>
            </div> */}
          </TabPanel>
          <TabPanel className="flex flex-col gap-2 ">
            <SwitchTheme />
            <FontSelector />
            <FontSizeSelector />
            <LanguageSelector />
          </TabPanel>
          <TabPanel className="flex flex-col gap-2 ">
            <AIModelSelector />
            <ApiKey />
          </TabPanel>
          <TabPanel className="flex flex-col gap-2 ">
            <AppInfo />
            <SocialMedias />
          </TabPanel>
        </TabPanels>

        {/* <div className="w-full h-0.5 dark:bg-white/5 bg-main-light/10 !my-4 rounded-full shadow-md" />
        
        <div className="w-full h-0.5 dark:bg-white/5 bg-main-light/10 !my-4 rounded-full shadow-md" />
        
        <div className="w-full h-0.5 dark:bg-white/5 bg-main-light/10 !my-4 rounded-full shadow-md" /> */}
      </TabGroup>
    </main>
  );
};

export default Settings;
