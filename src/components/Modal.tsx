import { Dialog, DialogPanel } from '@headlessui/react'
import { cloneElement, ReactElement, useState } from 'react'

export default function Modal({ Button: btn, children }: { Button: ReactElement, children: ReactElement }) {
  let [isOpen, setIsOpen] = useState(false)

  function open() {
    setIsOpen(true)
  }

  function close() {
    setIsOpen(false)
  }

  return (
    <>
        {cloneElement(btn, { onClick: open })}
        <Dialog open={isOpen} as="div" className="relative z-10 focus:outline-none" onClose={close}>
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto bg-main-dark/80">
                <div className="flex min-h-full items-center justify-center">
                    <DialogPanel
                    transition
                    className="w-full max-w-md rounded-md dark:text-white dark:bg-main-light bg-[#eaeaea] backdrop-blur-2xl duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0 overflow-hidden"
                    >
                    {children}
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    </>
  )
}