import { useEffect, useState, type RefObject } from "react";

const CENTER_THRESHOLD = 100;

function isScrollable(el: HTMLElement): boolean {
  const style = getComputedStyle(el);
  return ["auto", "scroll"].includes(style.overflowY);
}

function findScrollParent(el: HTMLElement | null): HTMLElement | Window {
  let current = el?.parentElement;
  while (current) {
    if (isScrollable(current)) return current;
    current = current.parentElement;
  }
  return window;
}

export function useIsCenteredInScroll(ref: RefObject<HTMLElement | null>) {
  const [isCentered, setIsCentered] = useState(false);
  const scrollParentRef: { current: HTMLElement | Window | null } = { current: null };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    scrollParentRef.current = findScrollParent(el);

    const check = () => {
      const target = ref.current;
      if (!target || !scrollParentRef.current) return;
      const rect = target.getBoundingClientRect();
      const parent = scrollParentRef.current;
      const containerHeight =
        parent === window
          ? window.innerHeight
          : (parent as HTMLElement).getBoundingClientRect().height;
      const containerTop =
        parent === window ? 0 : (parent as HTMLElement).getBoundingClientRect().top;
      const centerY = containerTop + containerHeight / 2;
      const elementCenter = rect.top + rect.height / 2;
      setIsCentered(Math.abs(elementCenter - centerY) < CENTER_THRESHOLD);
    };

    check();
    const scrollEl = scrollParentRef.current === window ? window : (scrollParentRef.current as HTMLElement);
    scrollEl.addEventListener("scroll", check);
    window.addEventListener("resize", check);
    return () => {
      scrollEl.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [ref]);

  return isCentered;
}
