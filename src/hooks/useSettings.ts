import { useState, useEffect } from "react";
import type { AiProviderId } from "../constants/aiModels";
import {
  DEFAULT_AI_MODEL_ID,
  DEFAULT_AI_PROVIDER,
  parseLegacyAiModel,
} from "../constants/aiModels";
import { isOpenAIChatCompletionsModel } from "../utils/fetchAiModels";

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

function loadAiFromStorage(): { aiProvider: AiProviderId; aiModelId: string } {
  const stored = localStorage.getItem("aiModel");
  const legacy = parseLegacyAiModel(stored);
  if (legacy && legacy.provider === "openai" && isOpenAIChatCompletionsModel(legacy.modelId))
    return { aiProvider: DEFAULT_AI_PROVIDER, aiModelId: legacy.modelId };
  if (legacy) return { aiProvider: DEFAULT_AI_PROVIDER, aiModelId: DEFAULT_AI_MODEL_ID };
  const modelId = localStorage.getItem("aiModelId") || DEFAULT_AI_MODEL_ID;
  const safeModelId = isOpenAIChatCompletionsModel(modelId) ? modelId : DEFAULT_AI_MODEL_ID;
  return { aiProvider: DEFAULT_AI_PROVIDER, aiModelId: safeModelId };
}

const initialAi = loadAiFromStorage();

const defaultSettings: GlobalSettings = {
  apiKey: "",
  theme: "dark",
  font: "FiraCode",
  size: 14,
  aiProvider: DEFAULT_AI_PROVIDER,
  aiModelId: DEFAULT_AI_MODEL_ID,
};

export let globalSettings: GlobalSettings = {
  apiKey: localStorage.getItem("apiKey") || defaultSettings.apiKey,
  theme: localStorage.getItem("theme") || defaultSettings.theme,
  font: localStorage.getItem("globalFont") || defaultSettings.font,
  size: parseInt(
    localStorage.getItem("globalSize") || defaultSettings.size.toString(),
    10
  ),
  name: localStorage.getItem("name"),
  email: localStorage.getItem("email"),
  aiProvider: initialAi.aiProvider,
  aiModelId: initialAi.aiModelId,
};

const listeners = new Set<(newSettings: GlobalSettings) => void>();
const notifyAll = () => {
  listeners.forEach((listener) => listener(globalSettings));
};

const changeApiKey = (newApiKey: string) => {
  globalSettings = { ...globalSettings, apiKey: newApiKey };
  localStorage.setItem("apiKey", newApiKey);
  notifyAll();
};

const changeFont = (newFont: string) => {
  globalSettings = { ...globalSettings, font: newFont };
  localStorage.setItem("globalFont", newFont);
  notifyAll();
};

const changeSize = (newSize: number) => {
  globalSettings = { ...globalSettings, size: newSize };
  localStorage.setItem("globalSize", newSize.toString());
  notifyAll();
};

const changeSettings = (newSettings: Partial<GlobalSettings>) => {
  globalSettings = { ...globalSettings, ...newSettings };
  localStorage.setItem("apiKey", globalSettings.apiKey);
  localStorage.setItem("globalFont", globalSettings.font);
  localStorage.setItem("globalSize", globalSettings.size.toString());
  localStorage.setItem("name", globalSettings.name || "");
  localStorage.setItem("email", globalSettings.email || "");
  localStorage.setItem("aiProvider", globalSettings.aiProvider);
  localStorage.setItem("aiModelId", globalSettings.aiModelId);
  notifyAll();
};

export const useSettings = () => {
  const [settings, setSettings] = useState<GlobalSettings>(globalSettings);

  useEffect(() => {
    const listener = (newSettings: GlobalSettings) => {
      setSettings(newSettings);
    };

    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }, []);

  return { settings, changeApiKey, changeFont, changeSize, changeSettings };
};
export default useSettings;
