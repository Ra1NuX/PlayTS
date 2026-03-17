import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  ImperativePanelHandle,
} from "react-resizable-panels";
import { useEffect, useRef } from "react";
import useCompiler from "./hooks/useCompiler";
import { useTheme } from "./hooks/useTheme";
import { useFont } from "./hooks/useFonts";
import createAlignedOutput from "./utils/createAlignedOutput";

import EditorComponent from "./components/EditorComponent";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import OutputPanel from "./components/OutputPanel";
import CommandPalette from "./components/CommandPalette";
import RegisterCommandPaletteActions from "./components/CommandPaletteActions";
import useResizePanelSizes from "./hooks/useResizePanelSizes";
import { useBookmarksStore, useBookmarks } from "./stores/bookmarksStore";
import { useGlobalBookmarks } from "./hooks/useGlobalBookmarks";
import { useEnvVarsStore, useEnvVars } from "./stores/envVarsStore";
import { useGlobalEnvVars } from "./hooks/useGlobalEnvVars";
import { useCloudSync } from "./hooks/useCloudSync";
import { useUpdateListener } from "./hooks/useUpdateListener";
import UpdateToast from "./components/UpdateToast";

function App() {
  const { theme } = useTheme();
  const { result, code } = useCompiler();
  const { font, size } = useFont();

  useBookmarksStore();
  useEnvVarsStore();

  const bookmarks = useBookmarks();
  useGlobalBookmarks({ bookmarks });

  const envVars = useEnvVars();
  useGlobalEnvVars({ envVars });

  useCloudSync();
  useUpdateListener();

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

  return (
    <main className="h-screen flex flex-col font-[roboto] font-bold text-main-dark">
      <CommandPalette />
      <RegisterCommandPaletteActions />
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
                    <OutputPanel
                      filledArray={filledArray}
                      font={font}
                      size={size}
                      theme={theme}
                      hasResults={result?.length > 0}
                    />
                  </Panel>
                </PanelGroup>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </section>
      <UpdateToast />
    </main>
  );
}

export default App;
