import { useEffect, useState } from "react";
import useSettings, { AiModel } from "./useSettings";
import { callOpenAI } from "../utils/callOpenAI";
import i18next from "i18next";

interface ChatProps {
  role: string;
  content: string;
  error?: boolean;
  code?: string;
  accepted?: boolean;
  id?: string | null;
}

const globalChatHistory: ChatProps[] = [];

i18next.on("languageChanged", () => {
  if (globalChatHistory.length <= 1) {
    console.log("language changed");
    globalChatHistory.length = 0;
    globalChatHistory.push({
      role: "assistant",
      content: i18next.t("STARTING_MESSAGE"),
    });
    notifyAll(); // para que los listeners se actualicen
  }
});

const listeners = new Set<(newMessage: ChatProps[]) => void>();

const notifyAll = () => {
  listeners.forEach((listener) => listener(globalChatHistory));
};

const useChat = () => {
  const { settings } = useSettings();
  const [chatHistory, setChatHistory] =
    useState<ChatProps[]>(globalChatHistory);

  useEffect(() => {
    const listener = (newMessage: ChatProps[]) => setChatHistory(newMessage);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const [message, setMessage] = useState<string>("");

  const addMessage = async () => {
    if (!message.trim()) return;
    setMessage("");
    setChatHistory((prev) => [...prev, { role: "user", content: message }]);
    setChatHistory((prev) => [...prev, { role: "assistant", content: "" }]);
    switch (settings.aiModel) {
      case AiModel.GPT_4O:
      case AiModel.GPT_4O_MINI:
      case AiModel.GPT_4_5_PREVIEW:
      case AiModel.GPT_O1:
      case AiModel.GPT_O3:
        await callOpenAI(
          [...chatHistory, { role: "user", content: `${message}` }],
          (data) => {
            setChatHistory((prev) => [
              ...prev.slice(0, -1),
              { role: "assistant", content: data.response },
            ]);
          },
          (data) => {
            globalChatHistory.push({ role: "user", content: message });
            globalChatHistory.push({
              role: "assistant",
              content: data.response,
              error: data.error,
              code: data.code,
              id: data.id,
            });
            notifyAll();
          }
        );
    }

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
    setChatHistory([
      {
        role: "assistant",
        content: i18next.t("STARTING_MESSAGE"),
      },
    ]);
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
