import { KeyboardEvent, MouseEvent, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
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
import Code from "./chat/Code";

interface FooterProps {
  open?: boolean;
}

const Footer = ({ open }: FooterProps) => {


  const { chatHistory, addMessage, message, setMessage,  } =
    useChat();

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isAtBottomRef = useRef(true);

  useEffect(() => {
    if (isAtBottomRef.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  const handleSend = async (
    e: MouseEvent | KeyboardEvent<HTMLTextAreaElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    addMessage();
  };

  return (
    <div
      aria-expanded={open}
      className="aria-expanded:h-full h-0 overflow-hidden flex flex-col flex-1"
    >
      <div
        ref={scrollContainerRef}
        onScroll={() => {
          const el = scrollContainerRef.current;
          if (!el) return;
          const isAtBottom =
            el.scrollHeight - el.scrollTop - el.clientHeight < 30;
          isAtBottomRef.current = isAtBottom;
        }}
        className="p-2 rounded-md dark:bg-main-dark bg-[#f7f7f7] font-normal flex flex-col flex-1 overflow-auto"
      >
        {chatHistory.map((msg, index) => (
          <>
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
                  <ReactMarkdown remarkPlugins={[remarkBreaks]} components={{
                    code({ children }) {
                      return <Code id={msg.id} code={String(children).replace(/\n$/, '')} />
                    }
                  }}>{msg.content}</ReactMarkdown>
                </div>
              </div>
              {msg.code &&
                index === chatHistory.length - 1 &&
                msg.accepted == undefined && (
                  <Code code={msg.code} id={msg.id}  />
                )}
            </div>
          </>
        ))}
        <div ref={messagesEndRef} />
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
