import { Panel, PanelGroup, PanelResizeHandle, ImperativePanelHandle } from "react-resizable-panels";
import SyntaxHighlighter from "react-syntax-highlighter";
import { useEffect, useRef, useState } from "react";
import { BsStars } from "react-icons/bs";

import useSettings from "./hooks/useSettings";
import useCompiler from "./hooks/useCompiler";
import { useTheme } from "./hooks/useTheme";
import { useFont } from "./hooks/useFonts";

import { darkTheme, lightTheme } from "./utils/customTheme";
import fillSpaces from "./utils/fillSpaces";

import EditorComponent from "./components/EditorComponent";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Footer from "./components/Footer";
import useResizePanelSizes from "./hooks/useResizePanelSizes";

function App() {
  const { theme } = useTheme();
  const { result } = useCompiler();
  const { settings } = useSettings();
  const { font, size } = useFont();

  const editorComponent = useRef<ImperativePanelHandle>(null);
  const outputComponent = useRef<ImperativePanelHandle>(null);
  const footerSection = useRef<ImperativePanelHandle>(null);
  const sidebarSection = useRef<ImperativePanelHandle>(null);

  const { width: minSize } = useResizePanelSizes("sidebar-main", { width: 52, height: 32 });
  const { width: maxSize } = useResizePanelSizes("sidebar-main", { width: 308, height: 32 });


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
      <section className="flex flex-row flex-1 w-full overflow-hidden dark:bg-main-dark bg-[#f7f7f7]">
        <PanelGroup direction="horizontal" id='sidebar-main'>
          <Panel
            minSize={minSize+5}
            maxSize={maxSize}
            collapsedSize={minSize}
            defaultSize={maxSize}
            collapsible
            id="sidebar"
            ref={sidebarSection}
            className="dark:bg-main-dark bg-[#f7f7f7] flex flex-row flex-1 h-full overflow-hidden"
          >
            <Sidebar ref={sidebarSection} />
          </Panel>
          <PanelResizeHandle id={'resize-handle-sidebar-main'} />
          <Panel className="pr-1.5">
            <PanelGroup direction="vertical">
              <Panel>
                <PanelGroup
                  direction="horizontal"
                  className="dark:bg-main-dark bg-[#f7f7f7] pb-1.5"
                >
                  <Panel minSize={20} className="rounded-md overflow-hidden dark:bg-main-light bg-[#eaeaea] p-2 rounded-r-none border-r-2 dark:border-r-main-dark border-r-[#f7f7f7]">
                    <EditorComponent />
                  </Panel>
                  <PanelResizeHandle />
                  <Panel minSize={20} className="break-words group overflow-y-scroll font-semibold font-mono leading-none dark:bg-main-light bg-[#eaeaea] rounded-md rounded-l-none border-l-2 dark:border-l-main-dark border-l-[#f7f7f7] w-full flex flex-col flex-1 p-2 px-4">
                      {Array.isArray(filledArray)
                        ? filledArray?.map((element, i) => {
                            if (element) {
                              const { text } = element;
                              return (
                                <div
                                  className="flex w-full rounded"
                                  key={
                                    element.text + "-" + element.line + "-" + i
                                  }
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
                                        theme === "dark"
                                          ? darkTheme
                                          : lightTheme
                                      }
                                      customStyle={{
                                        padding: 0,
                                        paddingLeft: "1.25rem",
                                        backgroundColor: "transparent",
                                        color:
                                          theme === "dark"
                                            ? "#fafafa"
                                            : "#0008",
                                        lineHeight: "27px",
                                      }}
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
                            if(footerSection.current?.isCollapsed()) {
                              footerSection.current?.expand(50);

                            } else {
                              footerSection.current?.collapse();
                            }
                          }}
                          className="absolute right-3.5 font-bold p-1.5 rounded-lg opacity-10 group-hover:opacity-100 transition-all duration-300 ease-in-out text-[#eaeaea]"
                        >
                          <BsStars className="text-xl" />
                        </button>
                      )}
                  </Panel>
                </PanelGroup>
              </Panel>
              <PanelResizeHandle />
              <Panel maxSize={70} minSize={20} collapsible defaultSize={0} ref={footerSection}>
                <Footer open={true} />
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </section>
    </main>
  );
}

export default App;
