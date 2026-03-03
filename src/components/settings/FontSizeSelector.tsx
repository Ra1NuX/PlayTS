import { FaMinus, FaPlus } from "react-icons/fa6";
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
    <div className="flex flex-row gap-5 justify-between">
      {t("EDITOR_FONT_SIZE")}
      <div className="group flex h-8 items-center rounded-xl transition-transform data-[checked]:bg-main-dark dark:bg-main-dark/50 bg-[#fafafa] shadow-md">
        <button
          className="w-7 hover:scale-125 transition-transform duration-200"
          onClick={() => changeSize(prevSize)}
        >
          <FaMinus className="inline" size={14} />
        </button>
        <input
          disabled
          className="w-7 h-7 text-center shadow-lg aspect-square rounded-full bg-white dark:bg-main-dark transition-transform group-data-[checked]:translate-x-6"
          value={size}
        />
        <button
          className="w-7 hover:scale-125 transition-transform duration-200"
          onClick={() => changeSize(nextSize)}
        >
          <FaPlus className="inline" size={14} />
        </button>
      </div>
    </div>
  );
};

export default FontSizeSelector;
