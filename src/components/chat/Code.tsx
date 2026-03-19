import SyntaxHighlighter from "react-syntax-highlighter";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import useChat from "../../hooks/useChat";
import useCompiler from "../../hooks/useCompiler";
import Kbd from "./Kbd";
import { useTheme } from "../../hooks/useTheme";
import { darkTheme, lightTheme } from "../../utils/customTheme";
import { Code as CodeIcon } from "lucide-react";

interface CodeProps {
  code: string;
  id?: string | null;
}

const Code = ({ code, id }: CodeProps) => {
  const { t } = useTranslation();
  const { updateCode } = useCompiler();
  const { setCodeState } = useChat();
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const handleEnter = () => {
    if (id) {
      updateCode(code || "");
      setCodeState(id, true);
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code || "");
  };

  return (
    <div
      className="my-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="group relative rounded border dark:border-divider-dark border-gray-300 overflow-hidden shadow-md dark:bg-main-dark bg-white">
        <div className="px-3 py-2 dark:bg-main-light bg-gray-50 border-b dark:border-divider-dark border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <CodeIcon className="h-4 w-4 dark:text-accent-dark text-accent-dark flex-shrink-0" />
              <span className="text-sm font-medium dark:text-white text-main-dark truncate">{t("CHAT_CODE_BLOCK")}</span>
            </div>
            {id && (
              <div className="flex items-center gap-1 flex-shrink-0 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200">
                <button
                  onClick={handleEnter}
                  className="flex items-center justify-center w-8 h-6 rounded dark:bg-accent-dark bg-accent-dark hover:bg-[#0d73ffb6] dark:hover:bg-[#0d73ffb6] text-white transition-all text-xs font-mono cursor-pointer"
                  title={t("CHAT_CODE_RUN_TITLE")}
                >
                  <Kbd keys={["Enter"]} onKeyPress={isHovered ? handleEnter : undefined} forceVisible />
                </button>
                <span className="dark:text-gray-400 text-gray-400 text-xs">|</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center justify-center min-w-8 h-6 rounded dark:bg-main-dark bg-gray-100 hover:bg-gray-200 dark:hover:bg-main-dark/80 dark:text-gray-300 text-main-dark border dark:border-main-dark border-gray-300 transition-all text-xs font-mono cursor-pointer"
                  title={t("CHAT_CODE_COPY_TITLE")}
                >
                  <Kbd keys={["Control", "C"]} onKeyPress={isHovered ? handleCopy : undefined} forceVisible />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="relative">
          <SyntaxHighlighter
            language="typescript"
            codeTagProps={{
              style: {
                whiteSpace: "pre-wrap",
                fontFamily: `"Fira Code", "Monaco", "Consolas", monospace`,
                fontSize: 12,
              },
            }}
            PreTag={"pre"}
            style={theme === "dark" ? darkTheme : lightTheme}
            customStyle={{
              padding: "1.5rem",
              backgroundColor: theme === "dark" ? "#1a1a1a" : "#f8f9fa",
              color: theme === "dark" ? "#e6e6e6" : "#2d3748",
              lineHeight: "1.6",
              margin: 0,
              fontWeight: "400",
            }}
            className="font-normal"
            showLineNumbers={false}
          >
            {code ?? ""}
          </SyntaxHighlighter>

          <div className="absolute left-0 top-0 bottom-0 w-1 dark:bg-accent-dark bg-accent-dark"></div>
        </div>
      </div>
    </div>
  );
};

export default Code;
