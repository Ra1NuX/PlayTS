import { useLayoutEffect, useState } from "react";

const useResizePanelSizes = (id: string, pixels: { width: number, height: number }) => {
  const [panelSizes, setPanelSizes] = useState({
    width: 0,
    height: 0,
  });

  useLayoutEffect(() => {
    const panelGroup = document.querySelector<HTMLElement>(
      `[data-panel-group-id="${id}"]`
    );
    const resizeHandles = document.querySelectorAll<HTMLElement>(
      `[data-panel-resize-handle-id="resize-handle-${id}"]`
    );

    if (!panelGroup) {
      console.error(`Panel group with id ${id} not found`);
      return;
    }

    const observer = new ResizeObserver(() => {
      let height = panelGroup.offsetHeight;
      let width = panelGroup.offsetWidth;

      resizeHandles.forEach((resizeHandle) => {
        height -= resizeHandle.offsetHeight;
        width -= resizeHandle.offsetWidth;
      });

      setPanelSizes(() => {
        return {
          width: (pixels.width / width) * 100,
          height: (pixels.height / height) * 100,
        };
      });
    });

    observer.observe(panelGroup);
    resizeHandles.forEach((resizeHandle) => {
      observer.observe(resizeHandle);
    });

    return () => {
      observer.unobserve(panelGroup);
      resizeHandles.forEach((resizeHandle) => {
        observer.unobserve(resizeHandle);
      });
      observer.disconnect();
    };
  }, []);
  return panelSizes;
};


export default useResizePanelSizes;