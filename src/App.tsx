import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  ImperativePanelHandle,
} from "react-resizable-panels";
import SyntaxHighlighter from "react-syntax-highlighter";
import { useEffect, useRef } from "react";
import useCompiler from "./hooks/useCompiler";
import { useTheme } from "./hooks/useTheme";
import { useFont } from "./hooks/useFonts";

import { darkTheme, lightTheme } from "./utils/customTheme";
import createAlignedOutput from "./utils/createAlignedOutput";

import EditorComponent from "./components/EditorComponent";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import useResizePanelSizes from "./hooks/useResizePanelSizes";
import { useBookmarksStore, useBookmarks } from "./stores/bookmarksStore";
import { useGlobalBookmarks } from "./hooks/useGlobalBookmarks";

function App() {
  const { theme } = useTheme();
  const { result, code } = useCompiler();
  const { font, size } = useFont();
  
  useBookmarksStore();
  
  const bookmarks = useBookmarks();
  useGlobalBookmarks({ bookmarks });

  const sidebarSection = useRef<ImperativePanelHandle>(null);

  const { width: minSize } = useResizePanelSizes("sidebar-main", {
    width: 48,
    height: 32,
  });
  const { width: maxSize } = useResizePanelSizes("sidebar-main", {
    width: 450,
    height: 32,
  });

  useEffect(() => {
    if (window.electron) {
      const main = async () => {
        const log = await import("electron-log/renderer");
        console = log as any;
      };
      main();
    }
  }, []);

  const filledArray = createAlignedOutput(result || [], code || "");

  // Función para limpiar códigos ANSI y mejorar el formato
  const cleanAndFormatText = (text: string): string => {
    // Limpiar códigos ANSI
    let cleanText = text.replace(/\x1b\[[0-9;]*m/g, '');
    
    // Mantener el formato original para que SyntaxHighlighter funcione correctamente
    return cleanText;
  };

  return (
    <main className="h-screen flex flex-col font-[roboto] font-bold text-main-dark">
      <Header />
      <section className="flex flex-row flex-1 w-full overflow-hidden dark:bg-main-dark bg-[#f7f7f7]">
        <PanelGroup direction="horizontal" id="sidebar-main">
          <Panel
            minSize={minSize ? minSize : 0}
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
          <PanelResizeHandle id={"resize-handle-sidebar-main"} />
          <Panel className="pr-1.5">
            <PanelGroup direction="vertical">
              <Panel>
                <PanelGroup
                  direction="horizontal"
                  className="dark:bg-main-dark bg-[#f7f7f7] pb-1.5 h-full"
                >
                  <Panel
                    minSize={20}
                    className="overflow-hidden dark:bg-main-light bg-[#eaeaea] p-2 rounded-r-none border-r-2 dark:border-r-divider-dark border-r-[#f7f7f7]"
                  >
                    <EditorComponent />
                  </Panel>
                  <PanelResizeHandle />
                  <Panel
                    minSize={20}
                    className="break-words group overflow-y-auto pr-1.5 font-semibold font-mono leading-none dark:bg-main-light bg-[#eaeaea] rounded-l-none border-l-2 dark:border-l-divider-dark border-l-[#f7f7f7] w-full flex flex-col p-2 px-4"
                  >
                    <div className="overflow-auto">
                      {Array.isArray(filledArray) && (filledArray.some(item => item && item.text && item.text.trim() !== " ") || result?.length > 0) ? (
                        filledArray?.map((element, i) => {
                            if (element) {
                              const { text } = element;
                              const cleanedText = cleanAndFormatText(text);
                              
                              // Si es una línea vacía, mostrar espacio invisible SOLO si hay contenido antes o después
                              if (text === " ") {
                                // Verificar si hay contenido real en el array (antes o después de esta línea)
                                const hasContentBefore = filledArray.slice(0, i).some(item =>
                                  item && item.text && item.text.trim() !== " "
                                );
                                const hasContentAfter = filledArray.slice(i + 1).some(item =>
                                  item && item.text && item.text.trim() !== " "
                                );

                                if (!hasContentBefore && !hasContentAfter) {
                                  return null; // No mostrar líneas vacías aisladas
                                }

                                return (
                                  <div
                                    className="flex w-full rounded"
                                    key={`empty-${element.line}-${i}`}
                                    style={{ height: "27px", fontFamily: font, fontSize: `${size}px` }} // Misma altura que SyntaxHighlighter
                                  >
                                    <div className="flex w-full justify-between font-mono">
                                      <div style={{ height: "27px" }}></div>
                                    </div>
                                  </div>
                                );
                              }
                              
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
                                        paddingRight: "1.25rem",
                                        backgroundColor: "transparent",
                                        color:
                                          theme === "dark"
                                            ? "#fafafa"
                                            : "#0008",
                                        lineHeight: "27px",
                                      }}
                                    >
                                      {cleanedText}
                                    </SyntaxHighlighter>
                                  </div>
                                </div>
                              );
                            }
                          })
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-500 p-4" style={{ fontFamily: font, fontSize: `${size}px` }}>
                            <div className="text-center">
                              <div className="text-lg mb-2">🚀 Listo para ejecutar código</div>
                              <div className="text-sm opacity-80">
                                Escribe código JavaScript/TypeScript y ejecútalo para ver los resultados aquí
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  </Panel>
                </PanelGroup>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </section>
    </main>
  );
}

export default App;
