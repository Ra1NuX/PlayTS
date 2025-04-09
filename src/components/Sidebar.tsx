import { forwardRef, MutableRefObject, useState } from "react";
import { ImperativePanelHandle } from "react-resizable-panels";
import { FaPause, FaPlay } from "react-icons/fa6";
import { useTranslation } from "react-i18next";
import { VscPackage, VscSettingsGear } from "react-icons/vsc";

import { DependenciesPanel } from "./SidebarPannel";
import Settings from "../Settings";
import MyModal from "./Modal";

import merge from "../tools/merge";

import useCompiler from "../hooks/useCompiler";
import { BsStars } from "react-icons/bs";
import Footer from "./Footer";
import { BiSolidPackage } from "react-icons/bi";

const Sidebar = forwardRef<ImperativePanelHandle>((_, ref) => {
  if (!ref || !("current" in ref) || !ref.current) return null;

  const [selected, setSelected] = useState<number | null>(null);
  const { paused, setPaused } = useCompiler();

  const open = (
    ref: MutableRefObject<ImperativePanelHandle | null>,
    index: number
  ) => {
    if (!ref.current) return;

    if (index === selected && !ref.current.isCollapsed()) {
      ref.current.collapse();
      return;
    }
    ref.current.expand(100);
  };

  const buttons = [
    {
      icon: paused ? (
        <FaPlay
          size={14}
          className="ml-[3px] dark:fill-[#ffffffaf] fill-main-dark/80 group-hover:fill-green-600 transition-colors duration-200"
        />
      ) : (
        <FaPause
          size={16}
          className="ml-[1px] dark:fill-[#ffffffaf] fill-main-dark/80 group-hover:fill-red-500 transition-colors duration-200"
        />
      ),
      title: paused ? "PLAY" : "PAUSE",
      className:
        "rounded-xl dark:hover:bg-white/10 hover:shadow-md border dark:border-white/5 group",
      onClick: () => {
        setPaused(!paused);
        // stop(!paused);
      },
    },
    {
      icon: <BiSolidPackage size={22} />,
      title: "DEPENDENCIES",
      onClick: (
        ref: MutableRefObject<ImperativePanelHandle | null>,
        index: number
      ) => {
        open(ref,index);
        setSelected(index);
      },
      panelItem: <DependenciesPanel />,
    },
    {
      icon: <BsStars size={22} />,
      title: "IA",
      onClick: (
        ref: MutableRefObject<ImperativePanelHandle | null>,
        index: number
      ) => {
        open(ref, index);
        setSelected(index);
      },
      panelItem: <Footer />,
    },
  ];

  const { t } = useTranslation();
  return (
    <>
      <aside className="dark:bg-main-dark bg-[#f7f7f7] p-2 pt-4 md:flex flex-col hidden">
        <section className="flex-1 flex flex-col gap-2">
          {buttons.map((button, index) => (
            <button
              key={index}
              title={t(button.title)}
              onClick={() => {
                if (button.onClick) {
                  button.onClick(ref, index);
                }
              }}
              className={merge(
                "flex w-9 h-9 aspect-square disabled:cursor-pointer dark:hover:bg-white/5 hover:bg-main-dark/5 items-center gap-2 p-2 dark:text-white font-bold rounded-xl transition-colors",
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
              <button className="flex w-9 h-9 aspect-square dark:hover:bg-white/5 hover:bg-main-dark/10 items-center gap-2 p-2 dark:text-white font-bold rounded-xl">
                <VscSettingsGear size={22} />
              </button>
            }
            children={<Settings />}
          />
        </section>
      </aside>
      <aside className="w-full transition-[width,padding] duration-100 dark:bg-main-dark bg-[#f7f7f7] aria-current:pr-0 py-2 pr-2 flex flex-col overflow-hidden">
        {buttons[selected!]?.panelItem}
      </aside>
    </>
  );
});

export default Sidebar;
