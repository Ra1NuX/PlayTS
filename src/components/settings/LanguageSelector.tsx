import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const locales = [
    { key: 'es', name: 'Español', flag: 'es' },
    { key: 'en', name: 'English', flag: 'en' },
  ]

const LanguageSelector = () => {
  const { t, i18n} = useTranslation();

  const changeLanguage = (language: string) => {
      i18n.changeLanguage(language);
  };

    const [selectedLocale, setSelectedLocale] = useState(
    locales.find((locale) => locale.key === i18n.language) || locales[0]
    );

  return (
    <div className="flex flex-row gap-5 justify-between items-center">
      {t('LANGUAGE')}
      <Listbox value={selectedLocale} onChange={(value) => {
        setSelectedLocale(value);
        changeLanguage(value.key);
      }}>
      <ListboxButton className='font-[roboto] font-normal dark:bg-main-dark/50 bg-[#fafafa] dark:hover:bg-main-dark hover:bg-[#f0f0f0] border shadow-md dark:border-main-dark/20 p-1 pr-2 rounded-xl flex justify-between min-w-[110px]'>
      <img className="w-6 aspect-square rounded-md object-cover" src={`/flags/${selectedLocale.flag}.png`} alt={`${selectedLocale.name} flag`} /> {selectedLocale.name} 
      </ListboxButton>
      <ListboxOptions anchor="bottom" className='z-20 dark:bg-main-light bg-[#f7f7f7] shadow-2xl border border-main-dark/20 rounded-lg mt-2 font-[roboto] font-normal'>
        {locales.map((locale) => (
          <ListboxOption key={locale.key} value={locale} className="dark:data-[focus]:bg-main-dark/80 p-2 flex gap-2 dark:text-white cursor-pointer hover:bg-main-light/20 justify-between min-w-[110px]">
            <img className="w-6 aspect-square rounded-md object-cover" src={`/flags/${locale.flag}.png`} alt={`${locale.name} flag`} />{locale.name}
          </ListboxOption>
        ))}
      </ListboxOptions>
    </Listbox>
    </div>
  );
};

export default LanguageSelector;
