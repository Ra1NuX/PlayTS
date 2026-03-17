import { useState } from 'react';
import { useChatStore } from '../stores/chatStore';
import type { ChatMessage } from '../stores/chatStore';
import { callAI } from '../utils/callAI';

export type { ChatMessage };

const useChat = () => {
  const chatHistory = useChatStore((s) => s.chatHistory);
  const pushMessages = useChatStore((s) => s.pushMessages);
  const updateLastMessage = useChatStore((s) => s.updateLastMessage);
  const setCodeAccepted = useChatStore((s) => s.setCodeAccepted);
  const clearMessages = useChatStore((s) => s.clearMessages);

  const [message, setMessage] = useState<string>('');

  const addMessage = async () => {
    if (!message.trim()) return;
    const userContent = message.trim();
    setMessage('');
    pushMessages(
      { role: 'user', content: userContent },
      { role: 'assistant', content: '' }
    );
    const messagesForApi = [...chatHistory, { role: 'user', content: userContent }];
    console.log('[useChat] addMessage called', {
      userContentLength: userContent.length,
      historyLength: chatHistory.length,
      messagesForApiLength: messagesForApi.length,
    });
    try {
      await callAI(messagesForApi, {
        onData: (data) => {
          console.log('[useChat] onData', { responseLength: data.response?.length ?? 0 });
          updateLastMessage({ role: 'assistant', content: data.response });
        },
        onFinally: (data) => {
          // Replace the last two temp messages with final versions in store
          const store = useChatStore.getState();
          const history = store.chatHistory;
          // Remove the temp assistant placeholder and temp user message, push final ones
          const withoutLast2 = history.slice(0, -2);
          useChatStore.setState({
            chatHistory: [
              ...withoutLast2,
              { role: 'user', content: userContent },
              {
                role: 'assistant',
                content: data.response,
                error: data.error,
                id: data.id,
              },
            ],
          });
        },
      });
    } catch (err) {
      console.error('[useChat] callAI threw', err);
    }
  };

  const setCodeState = (id: string, accepted: boolean) => {
    setCodeAccepted(id, accepted);
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
