import { useEffect, useState } from "react";

import transpileTypeScript from "../tools/convertToJS";
import { executeCode } from "../utils/codeExecution";
import { globalDependencies } from "./useDependencies";
import { generateGlobalBookmarkCode } from "../utils/bookmarkInjection";

interface ResultType {
  line: number;
  text: string;
  time: number;
}

const listeners = new Set<(result: ResultType[]) => void>();
const pausedListeners = new Set<(paused: boolean) => void>();
const codeListeners = new Set<(code: string) => void>();

let globalPaused = false;
let globalResult: ResultType[] = [];
export let globalCode = `// ¡Bienvenido a PlayTS!
// Escribe tu código JavaScript/TypeScript aquí y ejecútalo

console.log('¡Hola mundo desde PlayTS!');

// Ejemplos de lo que puedes hacer:
// - Ejecutar código JavaScript/TypeScript
// - Instalar paquetes npm
// - Usar bookmarks globales
// - Ver resultados alineados con tu código

// Prueba escribiendo algo aquí y presiona el botón de ejecutar`;
export let globalBookmarksCode = "";
export let globalEnvVars: Record<string, string> = {};

const initializeEnvVarsFromStorage = () => {
  try {
    const stored = localStorage.getItem('env-vars-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.state?.envVars) {
        const active = parsed.state.envVars.filter((ev: { isActive: boolean }) => ev.isActive);
        const record: Record<string, string> = {};
        active.forEach((ev: { key: string; value: string }) => {
          record[ev.key] = ev.value;
        });
        globalEnvVars = record;
      }
    }
  } catch (error) {
    console.error('Error initializing env vars:', error);
  }
};

const initializeBookmarksFromStorage = () => {
  try {
    const stored = localStorage.getItem('bookmarks-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.state?.bookmarks) {
        const bookmarks = parsed.state.bookmarks.map((b: any) => ({
          ...b,
          createdAt: new Date(b.createdAt)
        }));
        
        const activeBookmarks = bookmarks.filter((b: any) => b.isGloballyActive);
        
        if (activeBookmarks.length > 0) {
          globalBookmarksCode = generateGlobalBookmarkCode(activeBookmarks);
        }
      }
    }
  } catch (error) {
    console.error('Error inicializando bookmarks:', error);
  }
};

initializeEnvVarsFromStorage();
initializeBookmarksFromStorage();

const notifyAll = () => {
  listeners.forEach((listener) => listener(globalResult));
  pausedListeners.forEach((listener) => listener(globalPaused));
  codeListeners.forEach((listener) => listener(globalCode));
};

const setGlobalResult = (result: ResultType[]) => {
  globalResult = result;
  notifyAll();
};

const setPausedGlobal = (value: boolean) => {
  globalPaused = value;
  notifyAll();
};

const setGlobalCode = (code: string) => {
  globalCode = code;
  if (code.length < 300) localStorage.setItem("code", btoa(code));
  notifyAll();
};

export const setGlobalBookmarksCode = (code: string, shouldRerun = false) => {
  globalBookmarksCode = code;
  if (shouldRerun && !globalPaused && globalCode) {
    updateAndRunCode(globalCode).catch(console.error);
  }
};

export const setGlobalEnvVars = (envVars: Record<string, string>, shouldRerun = false) => {
  globalEnvVars = envVars;
  if (shouldRerun && !globalPaused && globalCode) {
    updateAndRunCode(globalCode).catch(console.error);
  }
};

const updateAndRunCode = async (code: string) => {
  setGlobalCode(code);
  if (globalPaused) return;

  try {
    const js = transpileTypeScript(code);
    const result = await executeCode({
      code: js,
      globalBookmarksCode: globalBookmarksCode,
      dependencies: globalDependencies,
      envVars: globalEnvVars,
    });
    console.log({result})
    setGlobalResult(result as ResultType[]);
  } catch (ex) {
    const { message, stack } = ex as Error;
    setGlobalResult([
      {
        line: 1,
        text: message || stack || JSON.stringify(ex),
        time: 10,
      },
    ]);
  }
};

const useCompiler = () => {
  const [result, setResult] = useState<ResultType[]>([]);
  const [paused, setPaused] = useState(false);
  const [code, setCodeState] = useState(globalCode);

  const pause = (isPaused: boolean) => {
    setPausedGlobal(isPaused);

    if (!isPaused) {
      const savedCode = localStorage.getItem("code");
      if (savedCode) {
        const decoded = atob(savedCode);
        updateAndRunCode(decoded).catch(console.error);
      }
    }
  };

  useEffect(() => {
    const listener = (newResult: ResultType[]) => setResult(newResult);
    const pausedListener = (newPaused: boolean) => setPaused(newPaused);
    const codeListener = (newCode: string) => setCodeState(newCode);

    listeners.add(listener);
    pausedListeners.add(pausedListener);
    codeListeners.add(codeListener);

    return () => {
      listeners.delete(listener);
      pausedListeners.delete(pausedListener);
      codeListeners.delete(codeListener);
    };
  }, []);

  return {
    updateCode: updateAndRunCode,
    setPaused: pause,
    setCode: setGlobalCode,
    code,
    paused,
    result,
  };
};

export default useCompiler;
