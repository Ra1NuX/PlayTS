import { useTranslation } from "react-i18next";
import { useUpdateStore } from "../../stores/updateStore";

const AppInfo = () => {
  const { t } = useTranslation();
  const updateVersion = useUpdateStore((s) => s.updateVersion);
  const installUpdate = useUpdateStore((s) => s.installUpdate);
  if (!window.electron) return null;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center dark:text-gray-100 text-gray-900 text-sm">
        <h2>{t("APP_VERSION")}</h2>
        <div className="flex flex-col space-y-1 text-right">
          <span className="dark:text-gray-400 text-gray-500 text-sm">{window.electron.getVersion()}</span>
        </div>
      </div>
      {updateVersion && (
        <div className="flex justify-between items-center dark:text-gray-100 text-gray-900 text-sm">
          <h2>{t("VERSION_UPDATE")}</h2>
          <button
            onClick={installUpdate}
            className="rounded-md bg-[#2b73da] px-3 py-1 text-sm font-medium text-white hover:bg-[#2563c0] transition-colors"
          >
            {t("UPDATE_BTN")} v{updateVersion}
          </button>
        </div>
      )}
    </div>
  );
};

export default AppInfo;
