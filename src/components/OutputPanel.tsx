import { useTranslation } from "react-i18next";
import { LineItem } from "../utils/createAlignedOutput";
import OutputLine from "./OutputLine";

interface OutputPanelProps {
  filledArray: LineItem[];
  font: string;
  size: number;
  theme: string;
  hasResults: boolean;
}

function cleanAndFormatText(text: string): string {
  let cleanText = text.replace(/\x1b\[[0-9;]*m/g, '');
  return cleanText;
}

const OutputPanel = ({ filledArray, font, size, theme, hasResults }: OutputPanelProps) => {
  const { t } = useTranslation();

  const hasContent = Array.isArray(filledArray) &&
    (filledArray.some(item => item && item.text && item.text.trim() !== " ") || hasResults);

  return (
    <div className="overflow-auto">
      {hasContent ? (
        filledArray?.map((element, i) => {
          if (element) {
            const cleanedText = cleanAndFormatText(element.text);

            const hasContentBefore = filledArray.slice(0, i).some(item =>
              item && item.text && item.text.trim() !== " "
            );
            const hasContentAfter = filledArray.slice(i + 1).some(item =>
              item && item.text && item.text.trim() !== " "
            );

            return (
              <OutputLine
                key={element.text + "-" + element.line + "-" + i}
                element={element}
                index={i}
                font={font}
                size={size}
                theme={theme}
                cleanedText={cleanedText}
                hasContentBefore={hasContentBefore}
                hasContentAfter={hasContentAfter}
              />
            );
          }
          return null;
        })
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500 p-4" style={{ fontFamily: `"${font}"`, fontSize: `${size}px` }}>
          <div className="text-center">
            <div className="text-lg mb-2">{t("READY_TO_RUN")}</div>
            <div className="text-sm opacity-80">
              {t("READY_TO_RUN_DESCRIPTION")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutputPanel;
