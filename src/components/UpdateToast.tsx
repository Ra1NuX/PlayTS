import { AnimatePresence, motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { useUpdateStore } from "../stores/updateStore";

const UpdateToast = () => {
  const { t } = useTranslation();
  const updateVersion = useUpdateStore((s) => s.updateVersion);
  const dismissed = useUpdateStore((s) => s.dismissed);
  const dismiss = useUpdateStore((s) => s.dismiss);
  const installUpdate = useUpdateStore((s) => s.installUpdate);

  const show = updateVersion !== null && !dismissed;

  return (
    <AnimatePresence>
      {!show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-4 right-4 z-50 max-w-[420px] gap-2 text-left rounded-lg border border-gray-300 dark:border-divider-dark dark:bg-main-contrast bg-[#f7f7f7] p-2 px-4 shadow-lg transition-opacity"
        >
          <p className="text-xs font-bold dark:text-gray-400 text-main-contrast mb-2">
            {t("UPDATE_VERSION_AVAILABLE", { version: updateVersion })}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={installUpdate}
              className="rounded-md text-xs bg-accent-dark px-3 py-1 font-medium text-white hover:bg-accent-dark/80 transition-colors"
            >
              {t("DOWNLOAD_BTN")}
            </button>
            <button
              onClick={dismiss}
              className="px-3 py-1 text-xs rounded-md dark:text-gray-300 text-gray-600 dark:hover:bg-divider-dark hover:bg-gray-200 transition-colors"
            >
              {t("DISMISS")}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpdateToast;
