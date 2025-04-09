// Basado en los otrso archivos de la carpeta src/hooks creame el hook useSettings.ts

import { useState, useEffect } from "react";

export enum AiModel {
  GPT_4O = "gpt-4o",
  GPT_3_5 = "gpt-3.5-turbo",
  GPT_4 = "gpt-4",
  GPT_4_TURBO = "gpt-4-turbo",
}

interface GlobalSettings {
  apiKey: string;
  aiModel: AiModel;
  theme: string;
  font: string;
  size: number;
  name?: string | null;
  email?: string | null;
}
const defaultSettings: GlobalSettings = {
  apiKey: "",
  theme: "dark",
  font: "FiraCode",
  size: 14,
  aiModel: AiModel.GPT_4O,
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
  aiModel: localStorage.getItem("aiModel") as AiModel || defaultSettings.aiModel,
};



const listeners = new Set<(newSettings: GlobalSettings) => void>();
const notifyAll = () => {
  listeners.forEach((listener) => listener(globalSettings));
};

/**
 * Hook que devuelve la fuente y el tamaño actuales, además de funciones para cambiarlos.
 * Al cambiar alguno de estos valores se actualiza la variable global, se guarda en localStorage
 * y se notifica a todos los componentes que usan este hook.
 */
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
    localStorage.setItem("aiModel", globalSettings.aiModel);
    notifyAll();
  }


  return { settings, changeApiKey, changeFont, changeSize, changeSettings };
};
export default useSettings;
export type { GlobalSettings };
