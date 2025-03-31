import { useState, useEffect } from "react";

interface GlobalSettings {
  font: string;
  size: number;
}

const defaultSettings: GlobalSettings = {
  font: "FiraCode",
  size: 14,
};

let globalSettings: GlobalSettings = {
  font: localStorage.getItem("globalFont") || defaultSettings.font,
  size: parseInt(localStorage.getItem("globalSize") || defaultSettings.size.toString(), 10),
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
export const useFont = () => {
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

  return { font: settings.font, size: settings.size, changeFont, changeSize };
};