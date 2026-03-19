import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LOCALES } from "../../constants/locales";

const LanguageSelector = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
  };

  const [selectedLocale, setSelectedLocale] = useState(
    LOCALES.find((locale) => locale.key === i18n.language) ?? LOCALES[0]
  );

  return (
    <div className="flex flex-row gap-5 justify-between items-center dark:text-gray-100 text-gray-900 text-sm">
      {t('LANGUAGE')}
      <Listbox value={selectedLocale} onChange={(value) => {
        setSelectedLocale(value);
        changeLanguage(value.key);
      }}>
      <ListboxButton className="h-9 px-3 text-sm rounded-lg border dark:border-[#2a2a2a] border-gray-200 dark:bg-[#111] bg-gray-50 dark:text-gray-100 text-gray-900 flex items-center gap-2 min-w-[130px] cursor-pointer hover:border-gray-300 dark:hover:border-[#333] transition-colors focus:ring-2 focus:ring-accent-dark/30 focus:border-accent-dark outline-none">
        <img className="w-5 h-5 rounded object-cover" src={`/flags/${selectedLocale.flag}`} alt={`${selectedLocale.name} flag`} />
        {selectedLocale.name}
      </ListboxButton>
      <ListboxOptions anchor="bottom" className="z-20 dark:bg-[#1a1a1a] bg-white border dark:border-[#2a2a2a] border-gray-200 rounded-lg mt-1 shadow-lg">
        {LOCALES.map((locale) => (
          <ListboxOption key={locale.key} value={locale} className="data-[focus]:bg-accent-dark/10 dark:data-[focus]:bg-accent-dark/20 px-3 py-2 flex gap-2 dark:text-gray-100 text-gray-900 cursor-pointer transition-colors items-center min-w-[130px] text-sm">
            <img className="w-5 h-5 rounded object-cover" src={`/flags/${locale.flag}`} alt={`${locale.name} flag`} />
            {locale.name}
          </ListboxOption>
        ))}
      </ListboxOptions>
    </Listbox>
    </div>
  );
};

export default LanguageSelector;
