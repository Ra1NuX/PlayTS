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
    <nav ref={header} className="h-10 dark:bg-main-dark bg-[#f7f7f7] drag z-10 p-1.5">
      <div className="md:w-4/12 w-full h-full leading-[30px] dark:text-[#f7f7f7] float-left pl-2 flex items-center gap-2 ">
        <img src="/icon.png" className="md:h-[25px] h-8 inline-block mt-1" />
        <p className="md:text-sm text-xl font-medium mt-0.5">
          PlayTS <span className="font-light dark:text-[#f7f7f740] text-main-dark/60 italic"> Beta</span>
        </p>
      </div>
      {window.electron && <CloseButtons />}
    </nav>
  );
};

export default Header;
