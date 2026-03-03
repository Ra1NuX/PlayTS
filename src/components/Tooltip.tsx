import { useState } from "react";
import { createPortal } from "react-dom";
import {
  useFloating,
  autoUpdate,
  offset,
  shift,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
} from "@floating-ui/react";

type Placement = "top" | "right" | "bottom" | "left";

type TooltipProps = {
  children: React.ReactNode;
  content: string;
  placement?: Placement;
} & React.HTMLAttributes<HTMLDivElement>;

const Tooltip = ({ children, content, placement = "right", onClick: restOnClick, ...rest }: TooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement,
    strategy: "fixed",
    middleware: [offset(8), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, { move: false });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "tooltip" });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  const refProps = getReferenceProps();
  const mergedOnClick = (e: React.MouseEvent<HTMLDivElement>) => {
    refProps.onClick?.(e);
    restOnClick?.(e);
  };

  const floatingContent = isOpen ? (
    <div
      ref={refs.setFloating}
      style={floatingStyles}
      {...getFloatingProps()}
      className="z-[9999] rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-gray-100 bg-gray-900 text-gray-100 shadow-lg"
    >
      {content}
    </div>
  ) : null;

  return (
    <>
      <div
        ref={refs.setReference}
        {...refProps}
        {...rest}
        onClick={mergedOnClick}
        className="inline-block"
      >
        {children}
      </div>
      {createPortal(floatingContent, document.body)}
    </>
  );
};

export default Tooltip;
