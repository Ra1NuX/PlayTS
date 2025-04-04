import { useEffect, useRef, useState } from "react";
import { BsStars } from "react-icons/bs";

import useCompiler from "./hooks/useCompiler";
import fillSpaces from "./utils/fillSpaces";
import SyntaxHighlighter from "react-syntax-highlighter";
import { darkTheme, lightTheme } from "./utils/customTheme";
import Header from "./components/Header";
import DraggableDivider from "./components/DraggableDivider";
import Sidebar from "./components/Sidebar";
import { useTheme } from "./hooks/useTheme";
import { useFont } from "./hooks/useFonts";
import useSettings from "./hooks/useSettings";
import Footer from "./components/Footer";
import LeftComponent from "./components/LeftComponent";

function App() {

  const { theme } = useTheme();
  const { result } = useCompiler();
  const { settings } = useSettings();
  const { font, size } = useFont();

  const rightContainerRef = useRef<HTMLDivElement>(null);

  const [openIaMenu, setOpenIaMenu] = useState(false);

  useEffect(() => {
    if (window.electron) {
      const main = async () => {
        const log = await import("electron-log/renderer");
        console = log as any;
      };
      main();
    }
  }, []);


  const filledArray = fillSpaces(result || []);

  return (
    <main className="h-screen flex flex-col font-[roboto] font-bold">
      <Header />
      <section className="flex flex-row flex-1 w-full overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 h-full overflow-hidden">
          <DraggableDivider
            leftComponent={<LeftComponent />}
            rightComponent={
              <div
                ref={rightContainerRef}
                className="break-words group overflow-y-auto font-semibold font-mono leading-none dark:bg-main-light bg-[#eaeaea] rounded-md rounded-l-none border-l dark:border-l-main-dark border-l-[#f7f7f7] w-full flex flex-col flex-1 p-2 px-4"
              >
                {Array.isArray(filledArray)
                  ? filledArray?.map((element, i) => {
                      if (element) {
                        const { text } = element;
                        return (
                          <div
                            className="flex w-full rounded"
                            key={element.text + "-" + element.line + "-" + i}
                          >
                            <div className="flex w-full justify-between font-mono">
                              <SyntaxHighlighter
                                language="javascript"
                                codeTagProps={{
                                  style: {
                                    whiteSpace: "pre-wrap",
                                    fontFamily: `"${font}"`,
                                    fontSize: size,
                                  },
                                }}
                                PreTag={"pre"}
                                style={
                                  theme === "dark" ? darkTheme : lightTheme
                                }
                                customStyle={{
                                  padding: 0,
                                  paddingLeft: "1.25rem",
                                  backgroundColor: "transparent",
                                  color: theme === "dark" ? "#fafafa" : "#0008",
                                  lineHeight: "27px",
                                }}
                                className={`font-normal text-[#f1fa8c] ${
                                  text !== "\n"
                                    ? "border-l-4 border-gray-900/10 "
                                    : ""
                                } pl-5`}
                              >
                                {text}
                              </SyntaxHighlighter>
                            </div>
                          </div>
                        );
                      }
                    })
                  : JSON.stringify(filledArray)}

                {settings.apiKey && (
                  <button
                    onClick={() => {
                      setOpenIaMenu((o) => !o);
                    }}
                    className="absolute right-3.5 font-bold p-1.5 rounded-lg opacity-10 group-hover:opacity-100 transition-all duration-300 ease-in-out text-[#eaeaea]"
                  >
                    <BsStars className="text-xl" />
                  </button>
                )}
              </div>
            }
          />
          <Footer open={openIaMenu} />
        </div>
      </section>
    </main>
  );
}

export default App;
