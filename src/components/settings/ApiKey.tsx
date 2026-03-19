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
    <div className="flex justify-between items-center dark:text-gray-100 text-gray-900 text-sm">
      <h2>{t("API_KEY")}</h2>
      <div className="flex gap-2 items-center group relative">
        <input
          type="text"
          placeholder={t("ENTER_API_KEY")}
          onChange={handleChange}
          ref={ref}
          className="h-9 px-3 pr-8 text-sm rounded-lg border dark:border-[#2a2a2a] border-gray-200 dark:bg-[#111] bg-gray-50 dark:text-gray-100 text-gray-900 placeholder:text-center dark:placeholder:text-gray-500 placeholder:text-gray-400 min-w-[180px] focus:ring-2 focus:ring-accent-dark/30 focus:border-accent-dark outline-none transition-colors"
        />
        {settings.apiKey && (
          <button
            onClick={() => {
              changeApiKey("");
              if (ref.current) ref.current.value = "";
            }}
            className="text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-lg transition-all duration-200 cursor-pointer hover:bg-red-500/10"
          >
            &times;
          </button>
        )}
      </div>
    </div>
  );
};

export default ApiKey;
