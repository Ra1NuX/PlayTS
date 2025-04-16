import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import useSettings from "../../hooks/useSettings";

const ApiKey = () => {
  const ref = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const { changeApiKey, settings} = useSettings();

  useEffect(() => {
    loadApiKey();
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newApiKey = e.target.value;
    changeApiKey(newApiKey);
  };

  const loadApiKey = () => {
    const { apiKey } = settings;
    if (apiKey) {
      const safeApiKey = apiKey.replace(
        /(.{4})(.*)(.{4})/,
        "$1****************$3"
      );
      ref.current?.setAttribute("placeholder", safeApiKey);
    } else {
      ref.current?.setAttribute("placeholder", t("ENTER_API_KEY"));
    }
  };

  return (
    <div className="flex justify-between items-center">
      <h2>{t("API_KEY")}</h2>
      <div className="flex gap-2 items-center group">
        <input
          type="text"
          placeholder={t("ENTER_API_KEY")}
          onChange={handleChange}
          ref={ref}
          className="font-[roboto] placeholder:text-center font-normal dark:bg-main-dark/50 bg-[#fafafa] dark:hover:bg-main-dark hover:bg-[#f0f0f0] border shadow-md dark:border-main-dark/20 p-1 pr-2 rounded-xl flex items-center justify-between min-w-[180px]"
        />
        { settings.apiKey && <button
          onClick={() => {
            changeApiKey("");
          }}
          className="text-sm text-red-500 hover:text-red-700 absolute right-5 aspect-square w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-[#f0f0f0] rounded-lg transition-opacity duration-200 ease-in-out"
        >
          &times;
        </button> }
      </div>
    </div>
  );
};

export default ApiKey;
