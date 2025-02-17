import { useTranslation } from "react-i18next";
import { useFont } from "../../hooks/useFonts";
import { useState } from "react";

const FontSizeSelector = () => {
  const { t } = useTranslation();

  const { size, changeSize } = useFont();

  return (
    <div className="flex flex-row gap-5 justify-between">
      {t("EDITOR_FONT_SIZE")}
      <div className="group flex h-6 items-center rounded-full  transition-transform data-[checked]:bg-main-dark dark:bg-main-dark/50 bg-[#fafafa] shadow-md">
        <button className="w-6" onClick={() => changeSize(Number(size) - 2)}>
          -
        </button>
        <input
          disabled
          className="w-7 h-7 text-center shadow-lg aspect-square rounded-full bg-white dark:bg-main-dark transition-transform group-data-[checked]:translate-x-6"
          value={size}
        />
        <button className="w-6" onClick={() => changeSize(!isNaN(Number(size) + 2) ? Number(size) + 2 : 16)}>
          +
        </button>
      </div>
    </div>
  );
};

export default FontSizeSelector;
