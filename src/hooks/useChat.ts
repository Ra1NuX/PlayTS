import { useEffect, useState } from "react";
import { callAI } from "../utils/callAI";
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
    globalChatHistory.length = 0;
    globalChatHistory.push({
      role: "assistant",
      content: i18next.t("STARTING_MESSAGE"),
    });
    notifyAll();
  }
});

const listeners = new Set<(newMessage: ChatProps[]) => void>();

const notifyAll = () => {
  listeners.forEach((listener) => listener(globalChatHistory));
};

const useChat = () => {
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
    const userContent = message.trim();
    setMessage("");
    setChatHistory((prev) => [...prev, { role: "user", content: userContent }]);
    setChatHistory((prev) => [...prev, { role: "assistant", content: "" }]);
    const messagesForApi = [...chatHistory, { role: "user", content: userContent }];
    console.log("[useChat] addMessage called", { userContentLength: userContent.length, historyLength: chatHistory.length, messagesForApiLength: messagesForApi.length });
    try {
      await callAI(
        messagesForApi,
        {
          onData: (data) => {
            console.log("[useChat] onData", { responseLength: data.response?.length ?? 0 });
            setChatHistory((prev) => [
              ...prev.slice(0, -1),
              { role: "assistant", content: data.response },
            ]);
          },
          onFinally: (data) => {
            console.log("[useChat] onFinally", {
              hasResponse: !!data.response,
              error: data.error,
              codeLength: data.code?.length ?? 0,
              responsePreview: data.response?.slice(0, 200),
              responseFullLength: data.response?.length,
              codePreview: data.code?.slice(0, 100),
            });
            console.log("[useChat] final message (full response)", data.response);
            console.log("[useChat] final message (code field)", data.code);
            globalChatHistory.push({ role: "user", content: userContent });
            globalChatHistory.push({
              role: "assistant",
              content: data.response,
              error: data.error,
              code: data.code,
              id: data.id,
            });
            notifyAll();
          },
        }
      );
    } catch (err) {
      console.error("[useChat] callAI threw", err);
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
