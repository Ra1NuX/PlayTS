import { Dialog, DialogPanel } from "@headlessui/react";
import { AnimatePresence, motion } from "motion/react";
import { cloneElement, ReactElement, useState } from "react";

export default function Modal({
  Button: btn,
  children,
}: {
  Button: ReactElement;
  children: ReactElement;
}) {
  let [isOpen, setIsOpen] = useState(false);

  function open() {
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
  }

  return (
    <>
      {cloneElement(btn, { onClick: open })}
      <Dialog
        open={isOpen}
        as="div"
        className="relative z-10 focus:outline-none"
        onClose={close}
      >
        <div className="fixed inset-0 z-10 w-screen overflow-hidden bg-black/50 backdrop-blur-sm">
          <AnimatePresence>
            <motion.div
              className="origin-center left-1/2 top-[10%] max-w-lg absolute"
              exit={{ scale: 0, x: "-50%" }}
              initial={{ scale: 0.99, opacity: 0.5, x: "-50%" }}
              animate={{ scale: 1, opacity: 1, x: "-50%" }}
              transition={{
                duration: 0.1,
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
            >
              <DialogPanel className="border border-divider dark:border-divider-dark min-h-fit rounded-lg  dark:text-white dark:bg-main-dark bg-[#f3f3f3] overflow-hidden">
                {cloneElement(children, { close, open })}
              </DialogPanel>
            </motion.div>
          </AnimatePresence>
        </div>
      </Dialog>
    </>
  );
}
