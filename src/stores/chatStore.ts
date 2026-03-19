import { create } from 'zustand';
import i18next from 'i18next';

export interface ChatMessage {
  role: string;
  content: string;
  error?: boolean;
  code?: string;
  accepted?: boolean;
  id?: string | null;
}

interface ChatState {
  chatHistory: ChatMessage[];
  pushMessages: (...messages: ChatMessage[]) => void;
  updateLastMessage: (update: Partial<ChatMessage>) => void;
  setCodeAccepted: (id: string, accepted: boolean) => void;
  clearMessages: () => void;
}

const getStartingMessage = (): ChatMessage => ({
  role: 'assistant',
  content: i18next.t('STARTING_MESSAGE'),
});

export const useChatStore = create<ChatState>()((set) => ({
  chatHistory: [getStartingMessage()],

  pushMessages: (...messages: ChatMessage[]) => {
    set((state) => ({
      chatHistory: [...state.chatHistory, ...messages],
    }));
  },

  updateLastMessage: (update: Partial<ChatMessage>) => {
    set((state) => ({
      chatHistory: [
        ...state.chatHistory.slice(0, -1),
        { ...state.chatHistory[state.chatHistory.length - 1], ...update },
      ],
    }));
  },

  setCodeAccepted: (id: string, accepted: boolean) => {
    set((state) => {
      const newHistory = [...state.chatHistory];
      const index = newHistory.findIndex((msg) => msg.id === id);
      if (index !== -1) {
        newHistory[index] = { ...newHistory[index], accepted };
      }
      return { chatHistory: newHistory };
    });
  },

  clearMessages: () => {
    set({ chatHistory: [getStartingMessage()] });
  },
}));

// Handle language changes - reset starting message if chat is fresh
i18next.on('languageChanged', () => {
  const { chatHistory } = useChatStore.getState();
  if (chatHistory.length <= 1) {
    useChatStore.setState({ chatHistory: [getStartingMessage()] });
  }
});
