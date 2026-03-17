import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import { parseUnclosedCodeFence } from "../../utils/parseUnclosedCodeFence";
import { normalizeStreamingMarkdown } from "../../utils/normalizeStreamingMarkdown";
import CodeBlockRenderer, { isBashLanguage, looksLikeMarkdown } from "./CodeBlockRenderer";
import Code from "./Code";
import Bash from "./Bash";

interface ChatMessageProps {
  msg: {
    role: string;
    content: string;
    error?: boolean;
    id?: string | null;
  };
  markdownClasses: string;
  isLastAssistant: boolean;
}

const ChatMessage = ({ msg, markdownClasses, isLastAssistant }: ChatMessageProps) => {
  const unclosed = parseUnclosedCodeFence(msg.content);
  let markdownSource = unclosed ? unclosed.markdownContent : msg.content;

  if (
    isLastAssistant &&
    (markdownSource.endsWith("**") || markdownSource.endsWith("_"))
  ) {
    markdownSource = normalizeStreamingMarkdown(markdownSource);
  }

  return (
    <div className={`${msg.role === "user" ? "flex justify-end" : ""}`}>
      <div
        aria-invalid={msg.error}
        className={`aria-invalid:text-red-600 aria-invalid:bg-transparent aria-invalid:border-red-300 dark:aria-invalid:border-red-800 text-left break-words whitespace-normal ${markdownClasses} ${
          msg.role === "user"
            ? "dark:bg-accent-dark/10 bg-blue-50 border dark:border-accent-dark/20 border-blue-100 rounded-lg p-3 max-w-[85%] dark:text-gray-100 text-gray-900"
            : "dark:bg-[#1a1a1a] bg-white border dark:border-[#2a2a2a] border-gray-200 rounded-lg p-3 dark:text-gray-100 text-gray-900"
        }`}
      >
        <ReactMarkdown
          remarkPlugins={[remarkBreaks]}
          components={{
            code({ children, className, ...props }) {
              return (
                <CodeBlockRenderer
                  className={className}
                  msgId={msg.id}
                  markdownClasses={markdownClasses}
                  {...props}
                >
                  {children}
                </CodeBlockRenderer>
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
                <div className={`my-2 ${markdownClasses}`}>
                  <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                    {unclosed.codeContent}
                  </ReactMarkdown>
                </div>
              ) : (
                <pre className="my-2 dark:bg-[#111] bg-gray-50 rounded-lg p-3 border dark:border-[#2a2a2a] border-gray-200 text-sm overflow-auto whitespace-pre-wrap font-normal dark:text-gray-200 text-gray-800">
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
  );
};

export default ChatMessage;
