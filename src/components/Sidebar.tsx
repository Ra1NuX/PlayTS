import {
  VscDebugPause,
  VscPackage,
  VscPlay,
  VscSettingsGear,
} from "react-icons/vsc";
import MyModal from "./Modal";
import Settings from "../Settings";
import { Dispatch, SetStateAction, useState } from "react";
import { DependenciesPanel } from "./SidebarPannel";
import { useTranslation } from "react-i18next";
import useCompiler from "../hooks/useCompiler";
import merge from "../tools/merge";
import { FaPause, FaPlay } from "react-icons/fa6";

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const { paused: p, setPaused: stop } = useCompiler();

  const [paused, setPaused] = useState(p);

  const buttons = [
    {
      icon: paused ? (
        <FaPlay
          size={14}
          className="ml-[3px] fill-[#ffffffaf] group-hover:fill-green-600 transition-colors duration-200"
        />
      ) : (
        <FaPause
          size={16}
          className="ml-[1px] fill-[#ffffffaf] group-hover:fill-red-500 transition-colors duration-200"
        />
      ),
      title: paused ? "PLAY" : "PAUSE",
      className:
        "rounded-xl hover:bg-white/10 hover:shadow-md border border-white/5 group",
      onClick: () => {
        setPaused(!paused);
        stop(!paused);
      },
    },
    {
      icon: <VscPackage size={22} />,
      title: "DEPENDENCIES",
      onClick: (setOpen: Dispatch<SetStateAction<boolean>>, index: number) => {
        setOpen((open: boolean) => !open);
        setSelected(index);
      },
      panelItem: <DependenciesPanel />,
    },
  ];

  const { t } = useTranslation();
  return (
    <>
      <aside className="dark:bg-main-dark bg-[#f7f7f7] p-2 pt-4 flex flex-col">
        <section className="flex-1 flex flex-col gap-2">
          {buttons.map((button, index) => (
            <button
              key={index}
              title={t(button.title)}
              onClick={() => {
                if (button.onClick) {
                  button.onClick(setOpen, index);
                }
              }}
              className={merge(
                "flex w-9 h-9 aspect-square hover:bg-white/5 items-center gap-2 p-2 dark:text-white font-bold rounded transition-colors",
                button.className
              )}
            >
              {button.icon}
            </button>
          ))}
        </section>
        <section className="flex flex-col gap-2 ">
          <MyModal
            Button={
              <button className="flex w-9 h-9 aspect-square hover:bg-white/5 items-center gap-2 p-2 dark:text-white font-bold rounded">
                <VscSettingsGear size={22} />
              </button>
            }
            children={<Settings />}
          />
        </section>
      </aside>
      <aside
        aria-current={!open}
        className="aria-current:w-0 w-72 dark:bg-main-dark bg-[#f7f7f7] py-2 pr-2 aria-current:hidden flex flex-col"
      >
        {buttons[selected!]?.panelItem}
      </aside>
    </>
  );
};

export default Sidebar;
