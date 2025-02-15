import { useState, useEffect } from "react";

// Inicializamos el tema global leyendo de localStorage (si está disponible)
let globalTheme = "dark";
if (typeof window !== "undefined") {
  const storedTheme = localStorage.getItem("theme");
  if (storedTheme) {
    globalTheme = storedTheme;
  }
}

// Conjunto de suscriptores (listeners) para notificar cuando el tema cambia
const listeners = new Set<(newTheme: string) => void>();

// Función que actualiza el tema global, lo guarda en localStorage y notifica a los suscriptores
const setGlobalTheme = (newTheme: string) => {
  globalTheme = newTheme;
  if (typeof window !== "undefined") {
    localStorage.setItem("theme", newTheme);
    if (newTheme === "light") {
      window.document.documentElement.classList.remove("dark");
    } else {
      window.document.documentElement.classList.add("dark");
    }
  }
  listeners.forEach((listener) => listener(newTheme));
};

export const useTheme = () => {
  // Inicializamos el estado local con el valor global
  const [theme, setTheme] = useState(globalTheme);

  useEffect(() => {
    // Función que actualiza el estado local al cambiar el tema global
    const listener = (newTheme: string) => {
      setTheme(newTheme);
    };

    // Se agrega la función listener al conjunto de suscriptores
    listeners.add(listener);

    if (globalTheme === "light") {
      window.document.documentElement.classList.remove("dark");
    } else {
      window.document.documentElement.classList.add("dark");
    }

    // Se limpia el suscriptor cuando el componente se desmonte
    return () => {
      listeners.delete(listener);
    };
  }, []);

  // Función para alternar el tema
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setGlobalTheme(newTheme);
  };

  return { theme, toggleTheme };
};
