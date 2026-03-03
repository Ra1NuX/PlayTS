import { forwardRef, MutableRefObject, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaPause, FaPlay } from "react-icons/fa6";
import { VscSettingsGear } from "react-icons/vsc";
import { ImperativePanelHandle } from "react-resizable-panels";

import Settings from "../Settings";
import Dependencies from "./Dependencies";
import Tooltip from "./Tooltip";

import merge from "../tools/merge";

import { BiSolidPackage } from "react-icons/bi";
import { BsBookmarkFill, BsStars, BsKey } from "react-icons/bs";
import useCompiler from "../hooks/useCompiler";
import useSettings from "../hooks/useSettings";
import Bookmarks from "./Bookmarks";
import IAChat from "./IAChat";
import EnvVars from "./EnvVars";

type Selected = number | "settings" | null;

const Sidebar = forwardRef<ImperativePanelHandle>((_, ref) => {
  const [selected, setSelected] = useState<Selected>(null);
  const { paused, setPaused } = useCompiler();
  const { settings } = useSettings();

  const { t } = useTranslation();

  if (!ref || !("current" in ref) || !ref.current) return null;

  const openPanel = (
    panelRef: MutableRefObject<ImperativePanelHandle | null>,
    key: Selected
  ) => {
    if (!panelRef.current) return;

    if (key === selected && !panelRef.current.isCollapsed()) {
      panelRef.current.collapse();
      return;
    }
    panelRef.current.expand(100);
  };

  const buttons = [
    {
      icon: paused ? <FaPlay size={16} /> : <FaPause size={16} />,
      title: paused ? "PLAY" : "PAUSE",
      onClick: () => {
        setPaused(!paused);
      },
    },
    {
      icon: <BiSolidPackage size={20} />,
      title: "DEPENDENCIES",
      onClick: (
        panelRef: MutableRefObject<ImperativePanelHandle | null>,
        index: number
      ) => {
        openPanel(panelRef, index);
        setSelected(index);
      },
      panelItem: <Dependencies />,
    },
    {
      icon: <BsStars size={20} />,
      title: "AI",
      hidden: !settings.apiKey,
      onClick: (
        panelRef: MutableRefObject<ImperativePanelHandle | null>,
        index: number
      ) => {
        openPanel(panelRef, index);
        setSelected(index);
      },
      panelItem: <IAChat />,
    },
    {
      icon: <BsBookmarkFill size={18} />,
      title: "BOOKMARKS",
      onClick: (
        panelRef: MutableRefObject<ImperativePanelHandle | null>,
        index: number
      ) => {
        openPanel(panelRef, index);
        setSelected(index);
      },
      panelItem: <Bookmarks />,
    },
    {
      icon: <BsKey size={18} />,
      title: "ENV_VARS",
      onClick: (
        panelRef: MutableRefObject<ImperativePanelHandle | null>,
        index: number
      ) => {
        openPanel(panelRef, index);
        setSelected(index);
      },
      panelItem: <EnvVars />,
    },
  ];

  const handleSettingsClick = () => {
    openPanel(ref as MutableRefObject<ImperativePanelHandle | null>, "settings");
    setSelected("settings");
  };

  const panelContent = selected === "settings"
    ? <Settings />
    : buttons[selected as number]?.panelItem;

  return (
    <>
      <aside className="dark:bg-main-dark bg-[#f3f3f3] w-12 min-w-12 max-w-12 shrink-0 md:flex flex-col hidden border-r dark:border-divider-dark border-gray-300">
        <section className="flex-1 flex flex-col items-center">
          {buttons.map((button, index) => {
            if (button.hidden) return null;
            const isSelected = selected === index;
            return (
              <div key={index} className="relative w-full flex justify-center">
                {isSelected && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-10 bg-accent-dark/80 rounded-r-full z-10" />
                )}
                <Tooltip content={t(button.title)} placement="right">
                  <button
                    onClick={() => {
                      if (button.onClick) {
                        button.onClick(ref as MutableRefObject<ImperativePanelHandle | null>, index);
                      }
                    }}
                    className={merge(
                      "relative flex items-center justify-center w-12 h-12 my-1 transition-all duration-200",
                      isSelected
                        ? "dark:text-white text-accent-dark"
                        : "dark:text-gray-400 text-gray-600 dark:hover:text-gray-200 hover:text-gray-800"
                    )}
                  >
                    <div className={
                      isSelected
                        ? "flex items-center justify-center w-full h-full transition-colors dark:bg-divider-dark bg-gray-200/50"
                        : "flex items-center justify-center w-full h-full transition-colors"
                    }>
                      {button.icon}
                    </div>
                  </button>
                </Tooltip>
              </div>
            );
          })}
        </section>
        <section className="flex flex-col aspect-square items-center justify-center border-t dark:border-divider-dark border-gray-300">
          <Tooltip content={t("SETTINGS")} placement="right">
            <button
              onClick={handleSettingsClick}
              className={merge(
                "flex items-center justify-center w-10 h-10 transition-colors",
                selected === "settings"
                  ? "dark:text-white text-accent-dark"
                  : "dark:text-gray-400 text-gray-600 dark:hover:text-gray-200 hover:text-gray-800"
              )}
            >
              <VscSettingsGear size={20} />
            </button>
          </Tooltip>
        </section>
      </aside>
      <aside className="w-full transition-[width,padding] duration-100 dark:bg-main-dark bg-[#f7f7f7] aria-current:px-0 py-2 px-2 flex flex-col overflow-hidden">
        {panelContent}
      </aside>
    </>
  );
});

export default Sidebar;
