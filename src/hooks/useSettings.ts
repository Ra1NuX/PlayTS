import { useSettingsStore } from '../stores/settingsStore';
import type { AiProviderId } from '../constants/aiModels';

export interface GlobalSettings {
  apiKey: string;
  aiProvider: AiProviderId;
  aiModelId: string;
  theme: string;
  font: string;
  size: number;
  name?: string | null;
  email?: string | null;
}

// For backward compat with callAI.ts - now reads from store
export const getGlobalSettings = (): GlobalSettings => {
  const state = useSettingsStore.getState();
  return {
    apiKey: state.apiKey,
    aiProvider: state.aiProvider,
    aiModelId: state.aiModelId,
    theme: state.theme,
    font: state.font,
    size: state.size,
    name: state.name,
    email: state.email,
  };
};

// Legacy mutable export - now a getter proxy for backward compat
export const globalSettings: GlobalSettings = new Proxy({} as GlobalSettings, {
  get(_target, prop: string) {
    const state = useSettingsStore.getState();
    return (state as any)[prop];
  },
});

export const useSettings = () => {
  const store = useSettingsStore();

  const settings: GlobalSettings = {
    apiKey: store.apiKey,
    aiProvider: store.aiProvider,
    aiModelId: store.aiModelId,
    theme: store.theme,
    font: store.font,
    size: store.size,
    name: store.name,
    email: store.email,
  };

  const changeApiKey = (key: string) => store.setApiKey(key);
  const changeFont = (font: string) => store.setFont(font);
  const changeSize = (size: number) => store.setSize(size);
  const changeSettings = (updates: Partial<GlobalSettings>) => {
    store.changeSettings(updates as any);
  };

  return { settings, changeApiKey, changeFont, changeSize, changeSettings };
};

export default useSettings;
