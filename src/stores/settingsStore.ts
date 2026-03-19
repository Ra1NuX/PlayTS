import { create } from 'zustand';
import type { AiProviderId } from '../constants/aiModels';
import {
  DEFAULT_AI_MODEL_ID,
  DEFAULT_AI_PROVIDER,
  parseLegacyAiModel,
} from '../constants/aiModels';
import { isOpenAIChatCompletionsModel } from '../utils/fetchAiModels';
import { STORAGE_KEYS } from '../constants/localStorage';

export interface SettingsState {
  apiKey: string;
  name: string | null;
  email: string | null;
  font: string;
  size: number;
  theme: string;
  aiProvider: AiProviderId;
  aiModelId: string;
  setApiKey: (key: string) => void;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setFont: (font: string) => void;
  setSize: (size: number) => void;
  setTheme: (theme: string) => void;
  toggleTheme: () => void;
  setAiProvider: (provider: AiProviderId) => void;
  setAiModelId: (modelId: string) => void;
  changeSettings: (updates: Partial<Pick<SettingsState, 'apiKey' | 'name' | 'email' | 'font' | 'size' | 'theme' | 'aiProvider' | 'aiModelId'>>) => void;
}

function loadAiFromStorage(): { aiProvider: AiProviderId; aiModelId: string } {
  const stored = localStorage.getItem('aiModel');
  const legacy = parseLegacyAiModel(stored);
  if (legacy && legacy.provider === 'openai' && isOpenAIChatCompletionsModel(legacy.modelId))
    return { aiProvider: DEFAULT_AI_PROVIDER, aiModelId: legacy.modelId };
  if (legacy) return { aiProvider: DEFAULT_AI_PROVIDER, aiModelId: DEFAULT_AI_MODEL_ID };
  const modelId = localStorage.getItem(STORAGE_KEYS.AI_MODEL_ID) || DEFAULT_AI_MODEL_ID;
  const safeModelId = isOpenAIChatCompletionsModel(modelId) ? modelId : DEFAULT_AI_MODEL_ID;
  return { aiProvider: DEFAULT_AI_PROVIDER, aiModelId: safeModelId };
}

function applyThemeClass(theme: string) {
  if (typeof window !== 'undefined') {
    if (theme === 'light') {
      window.document.documentElement.classList.remove('dark');
    } else {
      window.document.documentElement.classList.add('dark');
    }
  }
}

const initialAi = loadAiFromStorage();

const loadTheme = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
  }
  return 'dark';
};

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  apiKey: localStorage.getItem(STORAGE_KEYS.API_KEY) || '',
  name: localStorage.getItem(STORAGE_KEYS.SETTINGS_NAME),
  email: localStorage.getItem(STORAGE_KEYS.SETTINGS_EMAIL),
  font: localStorage.getItem(STORAGE_KEYS.GLOBAL_FONT) || 'FiraCode',
  size: parseInt(localStorage.getItem(STORAGE_KEYS.GLOBAL_SIZE) || '14', 10),
  theme: loadTheme(),
  aiProvider: initialAi.aiProvider,
  aiModelId: initialAi.aiModelId,

  setApiKey: (key: string) => {
    set({ apiKey: key });
    localStorage.setItem(STORAGE_KEYS.API_KEY, key);
  },

  setName: (name: string) => {
    set({ name });
    localStorage.setItem(STORAGE_KEYS.SETTINGS_NAME, name);
  },

  setEmail: (email: string) => {
    set({ email });
    localStorage.setItem(STORAGE_KEYS.SETTINGS_EMAIL, email);
  },

  setFont: (font: string) => {
    set({ font });
    localStorage.setItem(STORAGE_KEYS.GLOBAL_FONT, font);
  },

  setSize: (size: number) => {
    set({ size });
    localStorage.setItem(STORAGE_KEYS.GLOBAL_SIZE, size.toString());
  },

  setTheme: (theme: string) => {
    set({ theme });
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    applyThemeClass(theme);
  },

  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    get().setTheme(newTheme);
  },

  setAiProvider: (provider: AiProviderId) => {
    set({ aiProvider: provider });
    localStorage.setItem(STORAGE_KEYS.AI_PROVIDER, provider);
  },

  setAiModelId: (modelId: string) => {
    set({ aiModelId: modelId });
    localStorage.setItem(STORAGE_KEYS.AI_MODEL_ID, modelId);
  },

  changeSettings: (updates) => {
    const current = get();
    const merged = { ...current, ...updates };
    set(updates);
    localStorage.setItem(STORAGE_KEYS.API_KEY, merged.apiKey);
    localStorage.setItem(STORAGE_KEYS.GLOBAL_FONT, merged.font);
    localStorage.setItem(STORAGE_KEYS.GLOBAL_SIZE, merged.size.toString());
    localStorage.setItem(STORAGE_KEYS.SETTINGS_NAME, merged.name || '');
    localStorage.setItem(STORAGE_KEYS.SETTINGS_EMAIL, merged.email || '');
    localStorage.setItem(STORAGE_KEYS.AI_PROVIDER, merged.aiProvider);
    localStorage.setItem(STORAGE_KEYS.AI_MODEL_ID, merged.aiModelId);
    if (updates.theme !== undefined) {
      applyThemeClass(merged.theme);
    }
  },
}));
