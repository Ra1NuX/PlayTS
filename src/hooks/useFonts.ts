import { useSettingsStore } from '../stores/settingsStore';

/**
 * Hook que devuelve la fuente y el tamaño actuales, además de funciones para cambiarlos.
 * Al cambiar alguno de estos valores se actualiza la variable global, se guarda en localStorage
 * y se notifica a todos los componentes que usan este hook.
 */
export const useFont = () => {
  const font = useSettingsStore((s) => s.font);
  const size = useSettingsStore((s) => s.size);
  const setFont = useSettingsStore((s) => s.setFont);
  const setSize = useSettingsStore((s) => s.setSize);

  return { font, size, changeFont: setFont, changeSize: setSize };
};
