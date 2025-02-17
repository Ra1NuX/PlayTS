import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useFont } from "../../hooks/useFonts";

const fonts = [
  { key: "Roboto", name: "Roboto" },
  { key: "Press Start 2P", name: "Press Start 2P" },
  { key: 'Fira Code', name: 'Fira Code' },
  { key: 'Helvetica', name: 'Helvetica' },
];

const FontSelector = () => {
  const { t } = useTranslation();
  const { font, changeFont } = useFont();

  const [selectedFont, setSelectedFont] = useState(fonts.find(e => e.key === font) || fonts[0]);

  return (
    <div className="flex flex-row gap-5 justify-between items-center">
      {t("EDITOR_FONT")}
      <Listbox
        value={selectedFont}
        onChange={(value) => {
          setSelectedFont(value);
          changeFont(value.key);
        }}
      >
        <ListboxButton className="font-[roboto] font-normal dark:bg-main-dark/50 bg-[#fafafa] dark:hover:bg-main-dark hover:bg-[#f0f0f0] border shadow-md dark:border-main-dark/20 p-1 pr-2 rounded-xl flex items-center justify-between min-w-[180px]">
          <span className="px-2 py-0.5 bg-white/5 rounded-lg">Aa</span>
          {selectedFont.name}
        </ListboxButton>
        <ListboxOptions
          anchor="bottom"
          className="z-20 dark:bg-main-light bg-[#f7f7f7] shadow-2xl border border-main-dark/20 rounded-lg mt-2 font-[roboto] font-normal"
        >
          {fonts.map((font) => (
            <ListboxOption
              key={font.key}
              value={font}
              className="dark:data-[focus]:bg-main-dark/80 p-2 flex gap-2 dark:text-white cursor-pointer hover:bg-main-light/20 justify-between items-center min-w-[180px]"
            >
                <span className="px-2 py-0.5 bg-white/5 rounded-lg" style={{fontFamily: `"${font.key}"`}}>Aa</span>
              {font.name}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
    </div>
  );
};

export default FontSelector;
