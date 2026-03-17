import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useFont } from "../../hooks/useFonts";
import { EDITOR_FONTS } from "../../constants/editorFonts";

const FontSelector = () => {
  const { t } = useTranslation();
  const { font, changeFont } = useFont();

  const [selectedFont, setSelectedFont] = useState(
    EDITOR_FONTS.find((e) => e.key === font) ?? EDITOR_FONTS[0]
  );

  return (
    <div className="flex flex-row gap-5 justify-between items-center dark:text-gray-100 text-gray-900 text-sm">
      {t("EDITOR_FONT")}
      <Listbox
        value={selectedFont}
        onChange={(value) => {
          setSelectedFont(value);
          changeFont(value.key);
        }}
      >
        <ListboxButton className="h-9 px-3 text-sm rounded-lg border dark:border-[#2a2a2a] border-gray-200 dark:bg-[#111] bg-gray-50 dark:text-gray-100 text-gray-900 flex items-center justify-between min-w-[180px] gap-2 cursor-pointer hover:border-gray-300 dark:hover:border-[#333] transition-colors focus:ring-2 focus:ring-accent-dark/30 focus:border-accent-dark outline-none">
          <span className="px-2 py-0.5 dark:bg-white/5 bg-gray-200/50 rounded text-xs">Aa</span>
          {selectedFont.name}
        </ListboxButton>
        <ListboxOptions
          anchor="bottom"
          className="z-20 dark:bg-[#1a1a1a] bg-white border dark:border-[#2a2a2a] border-gray-200 rounded-lg mt-1 shadow-lg"
        >
          {EDITOR_FONTS.map((f) => (
            <ListboxOption
              key={f.key}
              value={f}
              className="data-[focus]:bg-accent-dark/10 dark:data-[focus]:bg-accent-dark/20 px-3 py-2 flex gap-2 dark:text-gray-100 text-gray-900 cursor-pointer transition-colors justify-between items-center min-w-[180px] text-sm"
            >
                <span className="px-2 py-0.5 dark:bg-white/5 bg-gray-200/50 rounded text-xs" style={{ fontFamily: `"${f.key}"` }}>Aa</span>
              {f.name}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
    </div>
  );
};

export default FontSelector;
