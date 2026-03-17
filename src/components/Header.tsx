import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import CloseButtons from "./CloseButtons";
import { getEnvironmentDisplayInfo } from "../utils/environment";
import { Search } from "lucide-react";
import { useKBar } from "kbar";
import Kbd from "./chat/Kbd";
import UserButton from "./auth/UserButton";

const Header = () => {
  const { t } = useTranslation();
  const header = useRef<HTMLElement>(null);
  const { query } = useKBar();

  useEffect(() => {
    if (window.electron) {
      window.electron.onToggleTitlebar((show: boolean) => {
        if (show) {
          header.current?.classList.remove("hidden");
        } else {
          header.current?.classList.add("hidden");
        }
      });
    }
  }, []);

  const envInfo = getEnvironmentDisplayInfo();

  return (
    <>
      <nav
        ref={header}
        className="h-10 dark:bg-main-contrast bg-[#f7f7f7] drag z-[100] relative px-1 pl-2 flex flex-row items-center gap-12 box-content border-b border-gray-300 dark:border-divider-dark"
      >
        <div className="flex items-center gap-2 w-fit">
          <img src="/icon.png" className="h-6 shrink-0" alt="" />
          <p className="text-sm font-medium truncate dark:text-[#f7f7f7]">
            PlayTS{" "}
            <span className="font-light dark:text-[#f7f7f740] text-main-dark/60 italic">
              Beta
            </span>
          </p>
        </div>
        <div className="flex justify-center w-full flex-1 flex-shrink-0">
          <button
            onClick={() => query.toggle()}
            className="no-drag flex items-center translate-x-16 max-w-[520px] text-xs w-full font-normal text-[#737373] h-8 gap-2 dark:bg-main-light bg-gray-100 dark:hover:bg-[#2f2f2fca] dark:hover:border-main px-2 rounded-lg box-border border border-gray-300 dark:border-divider-dark whitespace-nowrap"
          >
            <Search className="h-3 w-3 shrink-0" />
            <div className="flex-1 text-left">{t("HEADER_SEARCH_COMMAND")}</div>
            <Kbd keys={['Control', 'K']} />
          </button>
        </div>
        <div className="flex items-center justify-end gap-2 min-w-0">
          <UserButton />
          {envInfo.shouldShow && (
            <div
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-md shrink-0"
              style={{
                backgroundColor:
                  envInfo.platform === "electron" ? "#10b981" : "#3b82f6",
                color: envInfo.platform === "electron" ? "#10b981" : "#3b82f6",
              }}
            >
              <span className="font-mono font-bold text-white truncate max-w-[180px]">
                {envInfo.protocol} • {envInfo.environment} • {envInfo.execution}
              </span>
              <div
                className={`w-2 h-2 rounded-full shrink-0 ${
                  envInfo.executionMethod === "webcontainer"
                    ? "bg-blue-500"
                    : "bg-green-500"
                }`}
              />
            </div>
          )}
          {window.electron && <CloseButtons />}
        </div>
      </nav>
    </>
  );
};

export default Header;
