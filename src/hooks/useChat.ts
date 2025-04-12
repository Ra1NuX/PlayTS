import { useState } from "react";
import useSettings, { AiModel } from "./useSettings";
import { callOpenAI } from "../utils/callOpenAI";
import { globalCode } from "./useCompiler";
import { randomUUIDv7 } from "bun";

interface ChatProps {
  role: string;
  content: string;
  error?: boolean;
  code?: string;
  accepted?: boolean;
  id?: string | null;
}

const defaultChatHistory: ChatProps[] = [
  {
    role: "assistant",
    content: "Hola soy TSita, ¿en qué puedo ayudarte con este código?",
  },
];

const globalChatHistory: ChatProps[] = defaultChatHistory;

const listeners = new Set<(newMessage: ChatProps[]) => void>();

const notifyAll = () => {
  listeners.forEach((listener) => listener(globalChatHistory));
};

const useChat = () => {
  const { settings } = useSettings();
  const [chatHistory, setChatHistory] =
    useState<ChatProps[]>(globalChatHistory);

  const [message, setMessage] = useState<string>("");

  const addMessage = async () => {
    if (!message.trim()) return;
    setMessage("");
    setChatHistory((prev) => [...prev, { role: "user", content: message }]);
    setChatHistory((prev) => [...prev, { role: "assistant", content: "" }]);
    switch (settings.aiModel) {
      case AiModel.GPT_4O:
      case AiModel.GPT_3_5:
      case AiModel.GPT_4:
      case AiModel.GPT_4_TURBO:
        await callOpenAI(
          [
            ...chatHistory,
            {
              role: "system",
              content: `Este es el código mas actualizado, solo debes acceder a el cuando te pregunten algo del código: ${globalCode} `,
            },
            { role: "user", content: `${message}` },
          ],
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
                id: data.id,
              },
            ]);
          }
        );
    }
    notifyAll();
  };

  const setCodeState = (id: string, accepted: boolean) => {
    setChatHistory((prev) => {
      const newHistory = [...prev];
      const index = newHistory.findIndex((msg) => msg.id === id);
      newHistory[index] = {
        ...newHistory[index],
        accepted,
      };
      return newHistory;
    });
    notifyAll();
  };

  const clearMessages = () => {
    setChatHistory(defaultChatHistory);
    notifyAll();
  };

  return {
    chatHistory,
    message,
    addMessage,
    clearMessages,
    setMessage,
    setCodeState,
  };
};

export default useChat;
