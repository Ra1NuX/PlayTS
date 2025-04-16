import { useMemo, useState } from "react";
import useSettings from "../../hooks/useSettings";
import debounce from "../../tools/debounce";
import { useTranslation } from "react-i18next";

const EmailInput = () => {
  const { changeSettings, settings } = useSettings();
  const { t } = useTranslation();
  const [name, setName] = useState(settings.email);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    changeSettings({ email: e.target.value });
  };

  const debounced = useMemo(
    () =>
      debounce((e) => {
        handleChange(e);
      }, 500),
    []
  );

  return (
    <div>
      <h2 className="p-0.5">{t("EMAIL")}</h2>
      <input
        type="email"
        placeholder="example@gmail.com"
        value={name ?? ""}
        onChange={(e) => {
          setName(e.target.value);
          debounced(e);
        }}
        className="font-[roboto] p-1 px-2 font-normal dark:bg-main-dark/50 bg-[#fafafa] dark:hover:bg-main-dark hover:bg-[#f0f0f0] border shadow-md dark:border-main-dark/20 pr-2 rounded-xl flex items-center justify-between w-full"
      />
    </div>
  );
};

export default EmailInput;
