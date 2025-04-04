// Basado en los otrso archivos de la carpeta src/hooks creame el hook useSettings.ts

import { useState, useEffect } from "react";

interface GlobalSettings {
  apiKey: string;
  theme: string;
  font: string;
  size: number;
}
const defaultSettings: GlobalSettings = {
  apiKey: "",
  theme: "dark",
  font: "FiraCode",
  size: 14,
};

export let globalSettings: GlobalSettings = {
  apiKey: localStorage.getItem("apiKey") || defaultSettings.apiKey,
  theme: localStorage.getItem("theme") || defaultSettings.theme,
  font: localStorage.getItem("globalFont") || defaultSettings.font,
  size: parseInt(
    localStorage.getItem("globalSize") || defaultSettings.size.toString(),
    10
  ),
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

  return { settings, changeApiKey, changeFont, changeSize };
};
export default useSettings;
export type { GlobalSettings };
