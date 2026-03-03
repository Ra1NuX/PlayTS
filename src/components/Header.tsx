import { useEffect, useRef } from "react";
import CloseButtons from "./CloseButtons";
import { getEnvironmentDisplayInfo } from "../utils/environment";

const Header = () => {
  const header = useRef<HTMLElement>(null);

  useEffect(() => {
    if(window.electron) {
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
    <nav ref={header} className="h-10 dark:bg-main-contrast bg-[#f7f7f7] drag z-10 p-1.5 border-b dark:border-divider-dark border-gray-300 ">
      <div className="md:w-4/12 w-full h-full leading-[30px] dark:text-[#f7f7f7] float-left pl-2 flex items-center gap-2 ">
        <img src="/icon.png" className="md:h-[25px] h-8 inline-block mt-1" />
        <p className="md:text-sm text-xl font-medium mt-0.5">
          PlayTS <span className="font-light dark:text-[#f7f7f740] text-main-dark/60 italic"> Beta</span>
        </p>
      </div>
      <div className="float-right flex items-center gap-2 h-full">
        {envInfo.shouldShow && (
          <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-opacity-20"
               style={{
                 backgroundColor: envInfo.platform === 'electron' ? '#10b981' : '#3b82f6',
                 color: envInfo.platform === 'electron' ? '#10b981' : '#3b82f6'
               }}>
            <span className="font-mono font-bold text-white">
              {envInfo.protocol} • {envInfo.environment} • {envInfo.execution}
            </span>
            <div className={`w-2 h-2 rounded-full ${
              envInfo.executionMethod === 'webcontainer' ? 'bg-blue-500' : 'bg-green-500'
            }`}></div>
          </div>
        )}
        {window.electron && <CloseButtons />}
      </div>
    </nav>
  );
};

export default Header;
