import { ReactElement, useCallback, useEffect, useRef, useState } from "react";

const MIN_PANEL_WIDTH_PX = 200;

const DraggableDivider: React.FC<{
  leftComponent: ReactElement;
  rightComponent: ReactElement;
}> = ({ leftComponent, rightComponent }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dividerRatio, setDividerRatio] = useState<number>(0.5);
  const isDragging = useRef<boolean>(false);
  const animationFrame = useRef<number>();

  const onMouseMoveRef = useRef<(e: MouseEvent | TouchEvent) => void>();
  const onMouseUpRef = useRef<() => void>();

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;

    let newPositionPx = clientX - containerRect.left;

    let newRatio = newPositionPx / containerWidth;

    const minRatio = MIN_PANEL_WIDTH_PX / containerWidth;
    const maxRatio = 1 - minRatio;

    if (newRatio < minRatio) newRatio = minRatio;
    if (newRatio > maxRatio) newRatio = maxRatio;

    setDividerRatio(newRatio);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      let clientX: number;

      if (e instanceof MouseEvent) {
        clientX = e.clientX;
      } else if (e instanceof TouchEvent) {
        clientX = e.touches[0].clientX;
      } else {
        return;
      }

      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      animationFrame.current = window.requestAnimationFrame(() => {
        updatePosition(clientX);
      });
    },
    [updatePosition]
  );

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    if (onMouseMoveRef.current) {
      window.removeEventListener("mousemove", onMouseMoveRef.current);
      window.removeEventListener("touchmove", onMouseMoveRef.current);
    }
    if (onMouseUpRef.current) {
      window.removeEventListener("mouseup", onMouseUpRef.current);
      window.removeEventListener("touchend", onMouseUpRef.current);
    }
  }, []);

  const startDragging = useCallback(
    (clientX: number) => {
      isDragging.current = true;
      updatePosition(clientX);

      onMouseMoveRef.current = handleMouseMove;
      onMouseUpRef.current = handleMouseUp;

      window.addEventListener("mousemove", onMouseMoveRef.current);
      window.addEventListener("touchmove", onMouseMoveRef.current, {
        passive: false,
      });
      window.addEventListener("mouseup", onMouseUpRef.current);
      window.addEventListener("touchend", onMouseUpRef.current);
    },
    [handleMouseMove, handleMouseUp, updatePosition]
  );

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    startDragging(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    startDragging(e.touches[0].clientX);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      const delta = e.key === "ArrowLeft" ? -0.05 : 0.05;
      setDividerRatio((prev) => {
        let newRatio = prev + delta;
        if (!containerRef.current) return prev;
        const containerRect = containerRef.current.getBoundingClientRect();
        const minRatio = MIN_PANEL_WIDTH_PX / containerRect.width;
        const maxRatio = 1 - minRatio;
        if (newRatio < minRatio) newRatio = minRatio;
        if (newRatio > maxRatio) newRatio = maxRatio;
        return newRatio;
      });
    }
  };

  useEffect(() => {
    const initializeDivider = () => {
      if (containerRef.current) {
        setDividerRatio(0.5);
      }
    };

    initializeDivider();

    return () => {
      if (onMouseMoveRef.current) {
        window.removeEventListener("mousemove", onMouseMoveRef.current);
        window.removeEventListener("touchmove", onMouseMoveRef.current);
      }
      if (onMouseUpRef.current) {
        window.removeEventListener("mouseup", onMouseUpRef.current);
        window.removeEventListener("touchend", onMouseUpRef.current);
      }
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  const leftPanelWidthPercent = dividerRatio * 100;
  const rightPanelWidthPercent = (1 - dividerRatio) * 100;

  return (
    <div className="flex p-2 bg-main-dark h-full" ref={containerRef}>
      <div
        className="rounded-md overflow-hidden bg-main-light p-2 pl-0 rounded-r-none border-r border-r-main-dark"
        style={{ width: `${leftPanelWidthPercent}%` }}
      >
        {leftComponent}
      </div>
      <div
        className="relative h-full w-2 bg-main-dark cursor-ew-resize select-none touch-none"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onKeyDown={handleKeyDown}
        role="separator"
        tabIndex={0}
        aria-orientation="vertical"
        aria-label="Divider"
      />
      <div
        className="text-blue-300 break-words overflow-y-auto font-semibold font-mono leading-none bg-main-light rounded-md rounded-l-none border-l border-l-main-dark w-full flex flex-col flex-1 p-2 px-4"
        style={{ width: `${rightPanelWidthPercent}%` }}
      >
        {rightComponent}
      </div>
    </div>
  );
};

export default DraggableDivider;
