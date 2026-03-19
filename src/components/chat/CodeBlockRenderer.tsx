import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import Code from "./Code";
import Bash from "./Bash";

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

interface CodeBlockRendererProps {
  children?: React.ReactNode;
  className?: string;
  msgId?: string | null;
  markdownClasses: string;
  [key: string]: unknown;
}

const CodeBlockRenderer = ({
  children,
  className,
  msgId,
  markdownClasses,
  ...props
}: CodeBlockRendererProps) => {
  const hasLanguageClass =
    typeof className === "string" && className.includes("language-");

  if (!hasLanguageClass) {
    return (
      <code
        className="dark:bg-[#111] bg-gray-100 px-1.5 py-0.5 rounded font-mono text-xs dark:text-gray-200 text-gray-800"
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
        <div className={`my-2 ${markdownClasses}`}>
          <ReactMarkdown remarkPlugins={[remarkBreaks]}>
            {codeStr}
          </ReactMarkdown>
        </div>
      );
    }
    return (
      <pre className="my-2 dark:bg-[#111] bg-gray-50 rounded-lg p-3 border dark:border-[#2a2a2a] border-gray-200 text-sm overflow-auto whitespace-pre-wrap font-normal dark:text-gray-200 text-gray-800">
        {codeStr}
      </pre>
    );
  }

  return <Code id={msgId} code={codeStr} />;
};

export { isBashLanguage, looksLikeMarkdown };
export default CodeBlockRenderer;
