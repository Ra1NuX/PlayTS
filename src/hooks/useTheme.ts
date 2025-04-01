import { useState, useEffect } from "react";

let globalTheme = "dark";
if (typeof window !== "undefined") {
  const storedTheme = localStorage.getItem("theme");
  if (storedTheme) {
    globalTheme = storedTheme;
  }
}

const listeners = new Set<(newTheme: string) => void>();

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
  const [theme, setTheme] = useState(globalTheme);

  useEffect(() => {
    const listener = (newTheme: string) => {
      setTheme(newTheme);
    };

    listeners.add(listener);

    if (globalTheme === "light") {
      window.document.documentElement.classList.remove("dark");
    } else {
      window.document.documentElement.classList.add("dark");
    }

    return () => {
      listeners.delete(listener);
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setGlobalTheme(newTheme);
  };

  return { theme, toggleTheme };
};
