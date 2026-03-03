import { Fragment, KeyboardEvent, MouseEvent, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import useChat from "../hooks/useChat";
import Code from "./chat/Code";
import Bash from "./chat/Bash";
import { useTranslation } from "react-i18next";
import { BsArrowUpCircle } from "react-icons/bs";
import { parseUnclosedCodeFence } from "../utils/parseUnclosedCodeFence";
import { normalizeStreamingMarkdown } from "../utils/normalizeStreamingMarkdown";

function isBashLanguage(lang: string): boolean {
  return /^(bash|shell|sh)$/i.test(lang);
}

function looksLikeMarkdown(content: string): boolean {
  const t = content.trim();
  return (
    /(^|\n)#{1,6}\s/m.test(t) ||
    /\*\*[^*]+\*\*/.test(t) ||
    /__[^_]+__/.test(t) ||
    /^\s*[-*]\s/m.test(t) ||
    /^\s*\d+\.\s/m.test(t)
  );
}

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
        {chatHistory.map((msg, index) => {
          const unclosed = parseUnclosedCodeFence(msg.content);
          let markdownSource = unclosed ? unclosed.markdownContent : msg.content;
          const isLastAssistant =
            index === chatHistory.length - 1 && msg.role === "assistant";
          if (
            isLastAssistant &&
            (markdownSource.endsWith("**") || markdownSource.endsWith("_"))
          ) {
            markdownSource = normalizeStreamingMarkdown(markdownSource);
          }
          return (
            <Fragment key={index}>
              <div
                className={`mb-2 ${msg.role === "user" ? "text-right" : "text-left"}`}
              >
                <div
                  className={`flex items-center gap-2 ${msg.role === "user" ? "justify-end" : "text-left"}`}
                >
                  <div
                    aria-invalid={msg.error}
                    className={`aria-invalid:text-red-600 group text-left text-sm relative aria-invalid:bg-transparent aria-invalid:shadow-none inline-block break-words whitespace-normal ${msg.role === "user"
                      ? "bg-main-light w-full text-white p-1.5 border border-gray-200 dark:border-divider-dark rounded-md"
                      : "dark:text-white"
                    }`}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkBreaks]}
                      components={{
                        code({ children, className, ...props }) {
                          const hasLanguageClass =
                            typeof className === "string" &&
                            className.includes("language-");
                          if (!hasLanguageClass) {
                            return (
                              <code
                                className="dark:bg-main-dark/60 bg-gray-100 px-1 py-0.5 rounded font-mono text-xs"
                                {...props}
                              >
                                {children}
                              </code>
                            );
                          }
                          const match = /language-(\w*)/.exec(className || "");
                          const language = match ? match[1] : "";
                          const codeStr = String(children).replace(/\n$/, "");
                          if (isBashLanguage(language)) {
                            return <Bash code={codeStr} />;
                          }
                          if (!language || language === "plaintext" || language === "text") {
                            if (looksLikeMarkdown(codeStr)) {
                              return (
                                <div className="my-2 text-sm [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm [&_h1]:font-semibold [&_h2]:font-semibold [&_h3]:font-semibold [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_p]:my-1">
                                  <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                                    {codeStr}
                                  </ReactMarkdown>
                                </div>
                              );
                            }
                            return (
                              <pre className="my-2 p-3 rounded border dark:border-divider-dark border-gray-200 dark:bg-main-dark/50 bg-gray-50 text-sm overflow-auto whitespace-pre-wrap font-normal">
                                {codeStr}
                              </pre>
                            );
                          }
                          return (
                            <Code
                              id={msg.id}
                              code={codeStr}
                            />
                          );
                        },
                      }}
                    >
                      {markdownSource}
                    </ReactMarkdown>
                    {unclosed && (
                      <>
                        {isBashLanguage(unclosed.language) ? (
                          <Bash code={unclosed.codeContent} />
                        ) : !unclosed.language || /^(plaintext|text)$/i.test(unclosed.language) ? (
                          looksLikeMarkdown(unclosed.codeContent) ? (
                            <div className="my-2 text-sm [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm [&_h1]:font-semibold [&_h2]:font-semibold [&_h3]:font-semibold [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_p]:my-1">
                              <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                                {unclosed.codeContent}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <pre className="my-2 p-3 rounded border dark:border-divider-dark border-gray-200 dark:bg-main-dark/50 bg-gray-50 text-sm overflow-auto whitespace-pre-wrap font-normal">
                              {unclosed.codeContent}
                            </pre>
                          )
                        ) : (
                          <Code
                            code={unclosed.codeContent}
                            id={isLastAssistant ? msg.id : undefined}
                          />
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Fragment>
          );
        })}
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
