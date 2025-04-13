import { useEffect, useRef, useState } from "react";
import { Key } from "../../model/kbd";
import { AnimatePresence, motion } from "motion/react";
import { ensureKeyCode } from "../../utils/ensureKeyCode";

interface KbdProps {
  keys: Key[];
  onKeyPress?: (keys: Key[]) => void;
}

const Kbd = ({ keys, onKeyPress }: KbdProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const pressedKeys = useRef<Set<string>>(new Set());
  const scrollParent = useRef<HTMLElement | Window>();

  const isScrollable = (el: HTMLElement) => {
    const style = getComputedStyle(el);
    // Check if overflowY is set to 'auto' or 'scroll'
    return ["auto", "scroll"].includes(style.overflowY);
  };

  const findScrollParent = (el: HTMLElement | null): HTMLElement | Window => {
    let current = el?.parentElement;
    while (current) {
      if (isScrollable(current)) return current;
      current = current.parentElement;
    }
    return window;
  };

  const checkIfCentered = () => {
    console.log("checkIfCentered");
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const containerHeight =
      scrollParent.current === window
        ? window.innerHeight
        : (scrollParent.current as HTMLElement).getBoundingClientRect().height;

    const containerTop =
      scrollParent.current === window
        ? 0
        : (scrollParent.current as HTMLElement).getBoundingClientRect().top;

    const centerY = containerTop + containerHeight / 2;
    const elementCenter = rect.top + rect.height / 2;
    const isNearCenter = Math.abs(elementCenter - centerY) < 100;
    console.log({ isNearCenter });
    setActive(isNearCenter);
  };

  useEffect(() => {
    if (!ref.current) return;

    scrollParent.current = findScrollParent(ref.current);
    checkIfCentered();

    const scrollEl =
      scrollParent.current === window
        ? window
        : (scrollParent.current as HTMLElement);

    scrollEl.addEventListener("scroll", checkIfCentered);
    window.addEventListener("resize", checkIfCentered);

    return () => {
      scrollEl.removeEventListener("scroll", checkIfCentered);
      window.removeEventListener("resize", checkIfCentered);
    };
  }, []);

  useEffect(() => {
    if (!active || !onKeyPress) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      pressedKeys.current.add(normalizeKey(e.key));
      const allPressed = keys.every((k) =>
        pressedKeys.current.has(normalizeKey(k))
      );
      if (allPressed) {
        onKeyPress(keys);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      pressedKeys.current.delete(normalizeKey(e.key));
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [active, keys, onKeyPress]);

  useEffect(() => {
    if (!active || !onKeyPress) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      console.log({ key: e.key });
      pressedKeys.current.add(e.key);
      console.log({ pressedKeys: Array.from(pressedKeys.current) });

      const allKeysPressed = keys.every((k) =>
        pressedKeys.current.has(normalizeKey(k))
      );

      console.log({ allKeysPressed });

      if (allKeysPressed) {
        onKeyPress(keys);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      pressedKeys.current.delete(e.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [active, keys, onKeyPress]);

  const normalizeKey = (key: string): string =>
    key === " " ? " " : key.length === 1 ? key.toLowerCase() : key;

  return (
    <div ref={ref}>
      {onKeyPress ? (
        <AnimatePresence>
          {active && (
            <motion.div
              className="flex gap-1 items-center"
              exit={{ scale: 0, transition: { duration: 0.2 } }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                duration: 0.3,
                type: "spring",
                stiffness: 300,
                damping: 20,
                when: "beforeChildren",
              }}
            >
              {keys.map((key) => (
                <kbd
                  key={key}
                  className="dark:bg-gray-100/20 bg-white px-1.5 py-0.5 text-xs rounded shadow aria-checked:bg-[#ff79c597]/20 dark:aria-checked:bg-[#ff79c597]/20 "
                >
                  {ensureKeyCode(key)}
                </kbd>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <div className="flex gap-1 items-center">
          {keys.map((key) => (
            <kbd
              key={key}
              className="dark:bg-gray-100/20 bg-white px-1.5 py-0.5 text-xs rounded shadow aria-checked:bg-[#ff79c597]/20 dark:aria-checked:bg-[#ff79c597]/20 "
            >
              {ensureKeyCode(key)}
            </kbd>
          ))}
        </div>
      )}
    </div>
  );
};

export default Kbd;
