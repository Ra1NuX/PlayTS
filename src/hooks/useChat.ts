import { useState } from "react";
import useSettings, { AiModel } from "./useSettings";
import { callOpenAI } from "../utils/callOpenAI";

interface ChatProps {
  role: string;
  content: string;
  error?: boolean;
  code?: string;
  accepted?: boolean;
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
    }
    notifyAll();
  };

  const setCodeState = (index: number, accepted: boolean) => {
    setChatHistory((prev) => {
      const newHistory = [...prev];
      newHistory[index] = {
        ...newHistory[index],
        accepted,
      };
      return newHistory;
    }
    );
    notifyAll();
  };

  const clearMessages = () => {
    setChatHistory(defaultChatHistory);
    notifyAll();
  };

  return { chatHistory, message, addMessage, clearMessages, setMessage, setCodeState };
};

export default useChat;
