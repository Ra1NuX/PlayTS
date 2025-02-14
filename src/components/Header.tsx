import { useEffect, useRef } from "react";
import CloseButtons from "./CloseButtons";

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

  return (
    <nav ref={header} className="block w-full h-[30px] dark:bg-main-dark bg-[#f7f7f7] z-10 drag ">
      <div className="w-4/12 h-full leading-[30px] mt-1 dark:text-[#f7f7f7] float-left pl-2 flex items-center gap-2 pt-2 pb-2">
        <img src="/icon.png" className="h-[20px] inline-block" />
        <p className="text-xs font-medium">
          OpenTS <span className="font-light text-[#f7f7f740] italic">Alpha</span>
        </p>
      </div>
      {window.electron && <CloseButtons />}
    </nav>
  );
};

export default Header;
