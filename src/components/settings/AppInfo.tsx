import { useTranslation } from "react-i18next";

const AppInfo = () => {
  const { t } = useTranslation();
  if (!window.electron) return null;

  return (
    <div className="flex justify-between items-center">
      <h2>{t("APP_VERSION")}</h2>
      <div className="flex flex-col space-y-1 text-right font-normal">
        <span>{window.electron.getVersion()}</span>
        {/* <span>Author: <a href="" className="text-blue-500">Joaquin</a></span> */}
        {/* <span>License: MIT</span> */}
      </div>
    </div>
  );
};

export default AppInfo;
