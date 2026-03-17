import { Fragment, KeyboardEvent, MouseEvent, useEffect, useRef } from "react";
import useChat from "../hooks/useChat";
import { useTranslation } from "react-i18next";
import { ArrowUp } from "lucide-react";
import ChatMessage from "./chat/ChatMessage";

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

  const markdownClasses = "text-sm leading-relaxed [&_h1]:text-lg [&_h1]:font-semibold [&_h1]:mb-2 [&_h1]:mt-3 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mb-2 [&_h2]:mt-3 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mb-1 [&_h3]:mt-2 [&_p]:my-1.5 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_ul]:my-1.5 [&_ol]:my-1.5 [&_li]:my-0.5 [&_a]:text-accent-dark [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:dark:border-[#2a2a2a] [&_blockquote]:border-gray-200 [&_blockquote]:pl-3 [&_blockquote]:dark:text-gray-400 [&_blockquote]:text-gray-500 [&_blockquote]:my-2";

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
        className="flex flex-col flex-1 overflow-auto space-y-3 py-2"
      >
        {chatHistory.map((msg, index) => {
          const isLastAssistant =
            index === chatHistory.length - 1 && msg.role === "assistant";
          return (
            <Fragment key={index}>
              <ChatMessage
                msg={msg}
                markdownClasses={markdownClasses}
                isLastAssistant={isLastAssistant}
              />
            </Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex-shrink-0 mt-2 border dark:border-[#2a2a2a] border-gray-200 rounded-lg dark:bg-[#111] bg-gray-50 overflow-hidden">
        <textarea
          rows={3}
          spellCheck="false"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) handleSend(e);
          }}
          placeholder={t("MESSAGE_PLACEHOLDER")}
          className="min-h-[80px] resize-none w-full text-sm p-3 dark:bg-[#111] bg-gray-50 dark:text-gray-100 text-gray-900 dark:placeholder-gray-500 placeholder-gray-400 focus:outline-none"
        />
        <div className="flex items-center justify-end px-3 pb-2">
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="bg-accent-dark hover:bg-accent-dark/90 text-white rounded-lg p-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default IAChat;
