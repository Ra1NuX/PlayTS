import SyntaxHighlighter from "react-syntax-highlighter";
import useChat from "../../hooks/useChat";
import useCompiler from "../../hooks/useCompiler";
import Kbd from "./Kbd";
import { useTheme } from "../../hooks/useTheme";
import { darkTheme, lightTheme } from "../../utils/customTheme";

interface CodeProps {
  code: string;
  id?: string | null;
}

const Code = ({ code, id }: CodeProps) => {
  const { updateCode } = useCompiler();
  const { setCodeState } = useChat();
  const { theme } = useTheme();

  return (
    <div className="rounded-md border my-2 border-[#ff79c597] overflow-hidden">
      <span className="text-sm w-full flex items-center justify-between dark:bg-main-light">
        <span className="text-[#ff79c597] p-2 font-semibold">Código:</span>
        {id && (
          <div className="flex gap-2 p-2">
            <button
              onClick={() => {
                updateCode(code || "");
                setCodeState(id, true);
              }}
              className="hover:text-[#ff79c597] dark:hover:text-[#ff79c597] group flex items-center justify-center gap-1 dark:text-gray-300 text-gray-600"
            >
              <Kbd keys={["Enter"]} />
              {/* <span>Aceptar</span> */}
            </button>
            /
            <button
              onClick={() => {
                navigator.clipboard.writeText(code || "");
              }}
              className="hover:text-[#ff79c597] dark:hover:text-[#ff79c597] group flex items-center justify-center gap-1 dark:text-gray-300 text-gray-600"
            >
              <Kbd keys={["Ctrl", "C"]} />
              {/* <span>Cancelar</span> */}
            </button>
          </div>
        )}
      </span>
      <div className="h-[1px] w-full bg-[#ff79c597]  shadow-inner" />
      <SyntaxHighlighter
        language="typescript"
        codeTagProps={{
          style: {
            whiteSpace: "pre-wrap",
            fontFamily: `"fira Code"`,
            fontSize: 12,
          },
        }}
        PreTag={"pre"}
        style={theme === "dark" ? darkTheme : lightTheme}
        customStyle={{
          padding: "1.25rem",
          backgroundColor: theme === "dark" ? "#282a36" : "#fafafa",
          color: theme === "dark" ? "#fafafa" : "#0008",
          lineHeight: "27px",
        }}
        className={`font-normal text-[#f1fa8c] pl-5`}
      >
        {code ?? ""}
      </SyntaxHighlighter>
    </div>
  );
};

export default Code;
