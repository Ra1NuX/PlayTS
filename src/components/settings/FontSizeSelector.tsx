import { Minus, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useFont } from "../../hooks/useFonts";
import {
  MIN_FONT_SIZE,
  MAX_FONT_SIZE,
  FONT_SIZE_STEP,
} from "../../constants/editorFontSizes";

const FontSizeSelector = () => {
  const { t } = useTranslation();
  const { size, changeSize } = useFont();

  const current = Number(size);
  const nextSize = Math.min(MAX_FONT_SIZE, current + FONT_SIZE_STEP);
  const prevSize = Math.max(MIN_FONT_SIZE, current - FONT_SIZE_STEP);

  return (
    <div className="flex flex-row gap-5 justify-between items-center dark:text-gray-100 text-gray-900 text-sm">
      {t("EDITOR_FONT_SIZE")}
      <div className="flex h-9 items-center rounded-lg border dark:border-[#2a2a2a] border-gray-200 dark:bg-[#111] bg-gray-50 overflow-hidden">
        <button
          className="w-8 h-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors cursor-pointer dark:text-gray-400 text-gray-500"
          onClick={() => changeSize(prevSize)}
        >
          <Minus className="inline w-3 h-3" />
        </button>
        <input
          disabled
          className="w-9 h-full text-center text-sm dark:bg-[#1a1a1a] bg-white border-x dark:border-[#2a2a2a] border-gray-200 dark:text-gray-100 text-gray-900"
          value={size}
        />
        <button
          className="w-8 h-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors cursor-pointer dark:text-gray-400 text-gray-500"
          onClick={() => changeSize(nextSize)}
        >
          <Plus className="inline w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default FontSizeSelector;
