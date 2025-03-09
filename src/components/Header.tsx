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
    <nav ref={header} className="block w-full md:h-[30px] h-12 dark:bg-main-dark bg-[#f7f7f7] z-10 drag ">
      <div className="md:w-4/12 w-full h-full leading-[30px] mt-1 dark:text-[#f7f7f7] float-left pl-2 flex items-center gap-2 pt-2 pb-2">
        <img src="/icon.png" className="md:h-[20px] h-8 inline-block" />
        <p className="md:text-sm text-xl font-medium mt-0.5">
          OpenTS <span className="font-light dark:text-[#f7f7f740] text-main-dark/60 italic"> Beta</span>
        </p>
      </div>
      {window.electron && <CloseButtons />}
    </nav>
  );
};

export default Header;
