import { Fragment, KeyboardEvent, MouseEvent, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import { BiSend } from "react-icons/bi";

import useChat from "../hooks/useChat";
import Code from "./chat/Code";
import Bash from "./chat/Bash";
import { useTranslation } from "react-i18next";
import { BsArrowUp, BsArrowUpCircle, BsFillChatDotsFill } from "react-icons/bs";

interface IAChatProps {
  open?: boolean;
}

const IAChat = ({ open }: IAChatProps) => {
  const { chatHistory, addMessage, message, setMessage } = useChat();
  const { t } = useTranslation();

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
        id="scroll-container"
        className="p-2 rounded-md dark:bg-main-dark bg-[#f7f7f7] font-normal flex flex-col flex-1 overflow-auto"
      >
        {chatHistory.map((msg, index) => (
          <Fragment key={index}>
            <div
              key={index}
              className={`mb-2 ${msg.role === "user" ? "text-right" : "text-left"
                }`}
            >
              <div
                className={`flex items-center gap-2 ${msg.role === "user" ? "justify-end" : "text-left"
                  }`}
              >
                <div
                  aria-invalid={msg.error}
                  className={`aria-invalid:text-red-600 group text-left relative aria-invalid:bg-transparent aria-invalid:shadow-none inline-block p-2 border border-gray-200 dark:border-divider-dark rounded max-w-[90%] break-words whitespace-normal ${msg.role === "user"
                      ? "bg-[#0078D4] text-white"
                      : "dark:bg-main-light bg-[#fff] dark:text-white"
                    }`}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkBreaks]}
                    components={{
                      code({ children, className }) {
                        const match = /language-(\w+)/.exec(className || "");

                        const language = match ? match[1] : "";

                        if (language.includes('bash') || language.includes('shell') || language.includes('sh') || !language) {
                          return <Bash code={String(children).replace(/\n$/, "")} />;
                        }

                        if (match) {
                          return (
                            <Code
                              id={msg.id}
                              code={String(children).replace(/\n$/, "")}
                            />
                          );
                        }
                      },
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
              {msg.code &&
                index === chatHistory.length - 1 &&
                msg.accepted == undefined && (
                  <Code code={msg.code} id={msg.id} />
                )}
            </div>
          </Fragment>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="dark:bg-main-light bg-[#f7f7f7] border dark:border-divider-dark rounded-md mt-2">
        <div className="flex flex-grow relative flex-col">
          {/* <div className="flex items-center justify-end p-0.5">
            <span className="font-medium  dark:text-white text-main-dark text-xs rounded-md px-2 py-1 ">
              18.9%
            </span>
          </div> */}
          <textarea
            rows={2}
            spellCheck="false"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(e)}
            placeholder={t("MESSAGE_PLACEHOLDER")}
            className="field-content dark:bg-main-light max-h-[10rem] w-full text-sm p-2 py-1 rounded dark:text-white font-normal text-main-dark focus:outline-none placeholder:text-gray-400/30 "
          />
          <div className="flex items-center justify-end p-2">

            <button
              onClick={handleSend}
              className="text-gray-400 hover:text-white"
            >
              <BsArrowUpCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IAChat;
