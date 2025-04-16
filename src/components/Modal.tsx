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
        <div className="fixed inset-0 z-10 w-screen overflow-hidden bg-black/70">
          <AnimatePresence>
            <motion.div
              className="flex min-h-full items-center justify-center"
              exit={{ scale: 0 }}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.3,
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
            >
              <DialogPanel className="max-w-lg min-h-fit rounded-md absolute left-1/2 top-1/3 -translate-x-1/2 dark:text-white dark:bg-main-light bg-[#eaeaea] backdrop-blur-2xl duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0 overflow-hidden">
                {cloneElement(children, { close, open })}
              </DialogPanel>
            </motion.div>
          </AnimatePresence>
        </div>
      </Dialog>
    </>
  );
}
