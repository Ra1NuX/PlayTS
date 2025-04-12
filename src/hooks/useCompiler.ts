// Basado en lo que hay comentado y ademas en el resto de hooks de este proyecto, puedes crearme este hook que se encargue de compilar el codigo y ademas de ejecutar el js resultante, para que al final me devuelva un array de objetos con la siguiente estructura:
// Ten en cuennta que se debe usar en diferentes partes de la app y debe actualizarse en todos lados.

import { useEffect, useState } from "react";

import transpileTypeScript from "../tools/convertToJS";
import runCode from "../utils/runCode";

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
export let globalCode = "";

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

const updateAndRunCode = async (code: string) => {
  
  setGlobalCode(code);
  if (globalPaused) return;

  try {
    const js = transpileTypeScript(code);
    const result = await runCode(js);
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
