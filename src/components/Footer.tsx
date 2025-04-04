import { useState } from "react";
import { BiHelpCircle, BiSend } from "react-icons/bi";
import { callOpenAI } from "../utils/callOpenAI";
import useCompiler from "../hooks/useCompiler";

interface FooterProps {
  open?: boolean;
}

const Footer = ({ open }: FooterProps) => {
  const [message, setMessage] = useState("");
  const { writting } = useCompiler();
  const [chatHistory, setChatHistory] = useState<
    { role: string; content: string; error?: boolean }[]
  >([
    {
      role: "assistant",
      content: "Hola, ¿en qué puedo ayudarte con este código?",
    },
  ]);

  const handleSend = async () => {
    if (!message.trim()) return;
    setMessage("");

    setChatHistory((prev) => [...prev, { role: "user", content: message }]);
    setChatHistory((prev) => [...prev, { role: "assistant", content: '' }]);

    await callOpenAI(
      [...chatHistory, { role: "user", content: message }],
      (data) => {
        setChatHistory((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: data.response },
        ]);
      },
      (data) =>  {
        setChatHistory((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: data.response, error: data.error },
        ]);

        writting(data.code);

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
      className="aria-expanded:h-auto h-0 overflow-hidden pr-1.5 bg-main-dark"
    >
      <div className="h-64 overflow-auto rounded-md dark:bg-main-dark bg-[#f7f7f7] p-4">
        {chatHistory.map((msg, index) => (
          <div
            key={index}
            className={`mb-3 ${
              msg.role === "user" ? "text-right" : "text-left"
            }`}
          >
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
