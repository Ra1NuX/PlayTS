import { KeyboardEvent, MouseEvent } from "react";
import { BiSend } from "react-icons/bi";
import {
  IoMdCheckmarkCircleOutline,
  IoMdCloseCircleOutline,
} from "react-icons/io";

import useCompiler from "../hooks/useCompiler";
import SyntaxHighlighter from "react-syntax-highlighter";
import { darkTheme, lightTheme } from "../utils/customTheme";
import { useTheme } from "../hooks/useTheme";
import useChat from "../hooks/useChat";

interface FooterProps {
  open?: boolean;
}

const Footer = ({ open }: FooterProps) => {
  const { updateCode } = useCompiler();
  const {
    chatHistory,
    addMessage,
    message,
    setMessage,
    setCodeState
  } = useChat()

  const { theme } = useTheme();

  const handleSend = async (e: MouseEvent | KeyboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addMessage();
  };

  return (
    <div
      aria-expanded={open}
      className="aria-expanded:h-full h-0 overflow-hidden flex flex-col flex-1"
    >
      <div className="p-2 rounded-md dark:bg-main-dark bg-[#f7f7f7] font-normal flex flex-col flex-1 overflow-auto">
        {chatHistory.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 ${
              msg.role === "user" ? "text-right" : "text-left"
            }`}
          >
            <div
              className={`flex items-center gap-2 ${
                msg.role === "user" ? "justify-end" : "text-left"
              }`}
            >
              <div
                aria-invalid={msg.error}
                className={`aria-invalid:text-red-600 group text-left relative aria-invalid:bg-transparent aria-invalid:shadow-none inline-block p-2 shadow rounded-lg max-w-[90%] break-words whitespace-normal ${
                  msg.role === "user"
                    ? "bg-[#0078D4] text-white"
                    : "dark:bg-main-light bg-[#fff] dark:text-white"
                }`}
              >
                {msg.accepted && (
                <span className=" group-hover:opacity-100 opacity-0 transition-opacity duration-300 flex items-center justify-center gap-1 select-none absolute bottom-1 right-1">
                  <IoMdCheckmarkCircleOutline className="text-[#ff79c6] text-3xl" />
                  {/* <span className="text-sm text-[#ff79c6] font-semibold">
                    Aceptado
                  </span> */}
                </span>
              )}
              {msg.accepted == false && (
                <span className="flex items-center justify-center gap-1 select-none">
                  <IoMdCloseCircleOutline className="text-red-600" />
                  <span className="text-sm text-red-600 font-semibold">
                    Rechazado
                  </span>
                </span>
              )}
                {msg.content}
              </div>
              
            </div>
            {msg.code &&
              index === chatHistory.length - 1 &&
              msg.accepted == undefined && (
                <div className="rounded-md border mt-2 border-[#ff79c6] overflow-hidden shadow-lg">
                  <span className="text-sm w-full flex items-center justify-between dark:bg-main-light">
                    <span className="text-[#ff79c6] p-2 font-semibold">
                      Código:
                    </span>
                    <div className="flex gap-2 p-2">
                      <button
                        onClick={() => {
                          updateCode(msg.code || "");
                          setCodeState(index, true);
                        }}
                        className="hover:text-[#ff79c6] dark:hover:text-[#ff79c6] group flex items-center justify-center gap-1 dark:text-gray-300 text-gray-600"
                      >
                        <kbd className="dark:bg-gray-100/20 bg-white px-1.5 py-0.5 rounded shadow">
                          Enter
                        </kbd>
                        {/* <span>Aceptar</span> */}
                      </button>
                      /
                      <button
                        onClick={() => {
                          setCodeState(index, false);
                        }}
                        className="hover:text-[#ff79c6] dark:hover:text-[#ff79c6] group flex items-center justify-center gap-1 dark:text-gray-300 text-gray-600"
                      >
                        <kbd className="dark:bg-gray-100/20 bg-white px-1.5 py-0.5 rounded shadow">
                          Ctrl
                        </kbd>
                        <kbd className="dark:bg-gray-100/20 bg-white px-1.5 py-0.5 rounded shadow">
                          C
                        </kbd>
                        {/* <span>Cancelar</span> */}
                      </button>
                    </div>
                  </span>
                  <div className="h-[1px] w-full bg-[#ff79c6] " />
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
                      backgroundColor: theme === "dark" ? "#282a36" : "#eaeaea",
                      color: theme === "dark" ? "#fafafa" : "#0008",
                      lineHeight: "27px",
                    }}
                    className={`font-normal text-[#f1fa8c] pl-5`}
                  >
                    {msg.code ?? ""}
                  </SyntaxHighlighter>
                </div>
              )}
          </div>
        ))}
      </div>
      <div className="dark:bg-main-dark bg-[#f7f7f7] rounded-md">
        <div className="flex flex-grow relative">
          <textarea
            rows={1}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(e)}
            placeholder="Escribe un mensaje..."
            className="field-content border-main-light/20 dark:bg-main-light border max-h-64 w-full min-h-9 text-md p-1.5 pr-10 rounded dark:text-white font-normal text-main-dark focus:outline-none focus:border-[#0078D4]"
          />
          <button
            onClick={handleSend}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <BiSend className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Footer;
