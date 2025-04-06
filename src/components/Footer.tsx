import { useState } from "react";
import { BiHelpCircle, BiSend } from "react-icons/bi";
import {
  IoMdCheckmarkCircleOutline,
  IoMdCloseCircleOutline,
} from "react-icons/io";

import { callOpenAI } from "../utils/callOpenAI";
import useCompiler from "../hooks/useCompiler";
import SyntaxHighlighter from "react-syntax-highlighter";
import { darkTheme, lightTheme } from "../utils/customTheme";
import { useTheme } from "../hooks/useTheme";

interface FooterProps {
  open?: boolean;
}

const Footer = ({ open }: FooterProps) => {
  const [message, setMessage] = useState("");
  const { updateCode } = useCompiler();

  const { theme } = useTheme();

  const [chatHistory, setChatHistory] = useState<
    {
      role: string;
      content: string;
      error?: boolean;
      code?: string;
      accepted?: boolean;
    }[]
  >([
    {
      role: "assistant",
      content: "Hola, ¿en qué puedo ayudarte con este código?",
      code: `// Function to calculate the area of a circle
function calculateCircleArea(radius: number): number {
  // Math.PI provides the value of π
  // The area of a circle is π * radius^2
  return Math.PI * Math.pow(radius, 2);
}

// Example usage
const radius: number = 5;
const area: number = calculateCircleArea(radius);
console.log("The area of the circle is: " + area);`,
    },
  ]);

  const handleSend = async () => {
    if (!message.trim()) return;
    setMessage("");

    setChatHistory((prev) => [...prev, { role: "user", content: message }]);
    setChatHistory((prev) => [...prev, { role: "assistant", content: "" }]);

    await callOpenAI(
      [...chatHistory, { role: "user", content: message }],
      (data) => {
        setChatHistory((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: data.response },
        ]);
      },
      (data) => {
        setChatHistory((prev) => [
          ...prev.slice(0, -1),
          {
            role: "assistant",
            content: data.response,
            error: data.error,
            code: data.code,
          },
        ]);
      }
    );
  };

  const handleExplain = () => {
    setChatHistory([
      ...chatHistory,
      {
        role: "user",
        content: "Explica este código",
      },
    ]);

    // Simular respuesta de la IA
    setTimeout(() => {
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Este código crea un patrón de diamante con asteriscos. Utiliza Array.reduce() para construir el patrón línea por línea. La variable 'count' controla cuántos asteriscos se muestran en cada línea, y 'spaces' controla la indentación. El operador ternario incrementa o decrementa 'count' dependiendo de si estamos en la primera o segunda mitad del diamante.",
        },
      ]);
    }, 1000);
  };

  return (
    <div
      aria-expanded={open}
      className="aria-expanded:h-full h-0 overflow-hidden bg-main-dark flex flex-col flex-1"
    >
      <div className="py-4 overflow-scroll rounded-md dark:bg-main-dark bg-[#f7f7f7] font-normal flex flex-col flex-1">
        {chatHistory.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 ${
              msg.role === "user" ? "text-right" : "text-left"
            }`}
          >
            <div className={`flex items-center gap-2 ${
              msg.role === "user" ? "justify-end" : "text-left"
            }`}>
              <div
                aria-invalid={msg.error}
                className={`aria-invalid:!bg-red-300 inline-block p-2 shadow rounded-lg max-w-[80%] ${
                  msg.role === "user"
                    ? "bg-[#0078D4] text-white"
                    : "bg-main-light text-white"
                }`}
              >
                {msg.content}
              </div>
              {msg.accepted && (
                <span className="flex items-center justify-center gap-1 select-none">
                  <IoMdCheckmarkCircleOutline className="text-[#ff79c6]" />
                  <span className="text-sm text-[#ff79c6] font-semibold">
                    Aceptado
                  </span>
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
            </div>
            {msg.code &&
              index === chatHistory.length - 1 &&
              msg.accepted == undefined && (
                <div className="rounded-md border mt-2 border-[#ff79c6] overflow-hidden shadow-lg">
                  <span className="text-sm w-full flex items-center justify-between bg-main-light">
                    <span className="text-[#ff79c6] p-2 font-semibold">
                      Código:
                    </span>
                    <div className="flex gap-2 p-2">
                      <button
                        onClick={() => {
                          updateCode(msg.code || "", true);
                          setChatHistory((prev) =>
                            prev.map((m, i) =>
                              i === index ? { ...m, accepted: true } : m
                            )
                          );
                        }}
                        className="hover:text-[#ff79c6] group flex items-center justify-center gap-1 text-gray-300"
                      >
                        <kbd className="bg-gray-100/20  px-1.5 py-0.5 rounded">
                          Enter
                        </kbd>
                        <span>Aceptar</span>
                      </button>
                      <button onClick={() => {
                        setChatHistory((prev) =>
                          prev.map((m, i) =>
                            i === index ? { ...m, accepted: false } : m
                          )
                        );
                      }} className="hover:text-[#ff79c6] group flex items-center justify-center gap-1 text-gray-300">
                        <kbd className="bg-gray-100/20  px-1.5 py-0.5 rounded">
                          Ctrl
                        </kbd>
                        <kbd className="bg-gray-100/20  px-1.5 py-0.5 rounded">
                          C
                        </kbd>
                        <span>Cancelar</span>
                      </button>
                    </div>
                  </span>
                  <div className="h-[1px] w-full bg-[#ff79c6]" />
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
                      backgroundColor: "transparent",
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
      <div className="p-1.5 px-0 dark:bg-main-dark bg-[#f7f7f7]  flex items-center">
        <div className="flex space-x-2 mr-3">
          <button
            onClick={handleExplain}
            className="bg-[#252526] border-gray-600 hover:bg-[#3E3E42] text-white flex items-center justify-center p-2 rounded shadow"
          >
            <BiHelpCircle className="h-4 w-4 mr-2" />
            Explicar
          </button>
        </div>

        <div className="flex-grow relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Escribe un mensaje..."
            className="w-full p-2 pr-10 rounded dark:text-main-dark text-main-dark focus:outline-none focus:border-[#0078D4]"
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
