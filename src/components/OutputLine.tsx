import SyntaxHighlighter from "react-syntax-highlighter";
import { darkTheme, lightTheme } from "../utils/customTheme";
import { LineItem } from "../utils/createAlignedOutput";

interface OutputLineProps {
  element: LineItem;
  index: number;
  font: string;
  size: number;
  theme: string;
  cleanedText: string;
  hasContentBefore: boolean;
  hasContentAfter: boolean;
}

const OutputLine = ({
  element,
  index,
  font,
  size,
  theme,
  cleanedText,
  hasContentBefore,
  hasContentAfter,
}: OutputLineProps) => {
  const { text } = element;

  // Empty spacer line
  if (text === " ") {
    if (!hasContentBefore && !hasContentAfter) {
      return null;
    }

    return (
      <div
        className="flex w-full rounded"
        key={`empty-${element.line}-${index}`}
        style={{ height: "27px", fontFamily: `"${font}"`, fontSize: `${size}px` }}
      >
        <div className="flex w-full justify-between font-mono">
          <div style={{ height: "27px" }}></div>
        </div>
      </div>
    );
  }

  // Error line
  if (element.isError) {
    return (
      <div
        className="flex w-full rounded-md bg-red-500/10 dark:bg-red-500/10 border border-red-500/20 dark:border-red-500/20 px-3 py-1 mt-1"
        key={element.text + "-" + element.line + "-" + index}
      >
        <div className="flex w-full items-center font-mono">
          <span
            style={{
              fontFamily: `"${font}"`,
              fontSize: size,
              lineHeight: "27px",
              whiteSpace: "pre-wrap",
              color: theme === "dark" ? "#f87171" : "#dc2626",
            }}
          >
            {cleanedText}
          </span>
        </div>
      </div>
    );
  }

  // Normal output line
  return (
    <div
      className="flex w-full rounded"
      key={element.text + "-" + element.line + "-" + index}
    >
      <div className="flex w-full justify-between font-mono">
        <SyntaxHighlighter
          language="javascript"
          codeTagProps={{
            style: {
              whiteSpace: "pre-wrap",
              fontFamily: `"${font}"`,
              fontSize: size,
            },
          }}
          PreTag={"pre"}
          style={theme === "dark" ? darkTheme : lightTheme}
          customStyle={{
            padding: 0,
            paddingLeft: "1.25rem",
            paddingRight: "1.25rem",
            backgroundColor: "transparent",
            color: theme === "dark" ? "#fafafa" : "#0008",
            lineHeight: "27px",
          }}
        >
          {cleanedText}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default OutputLine;
