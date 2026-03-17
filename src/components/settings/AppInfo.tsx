import { useTranslation } from "react-i18next";

const AppInfo = () => {
  const { t } = useTranslation();
  if (!window.electron) return null;

  return (
    <div className="flex justify-between items-center dark:text-gray-100 text-gray-900 text-sm">
      <h2>{t("APP_VERSION")}</h2>
      <div className="flex flex-col space-y-1 text-right">
        <span className="dark:text-gray-400 text-gray-500 text-sm">{window.electron.getVersion()}</span>
      </div>
    </div>
  );
};

export default AppInfo;
