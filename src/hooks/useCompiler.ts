// Basado en lo que hay comentado y ademas en el resto de hooks de este proyecto, puedes crearme este hook que se encargue de compilar el codigo y ademas de ejecutar el js resultante, para que al final me devuelva un array de objetos con la siguiente estructura:
// Ten en cuennta que se debe usar en diferentes partes de la app y debe actualizarse en todos lados.

import { useEffect, useState } from "react";

import transpileTypeScript from "../tools/convertToJS";
import runCode from "../utils/runCode";
import debounce from "../tools/debounce";

interface ResultType {
  line: number;
  text: string;
  time: number;
}

// let paused = false;

// const setPaused = (value: boolean) => {
//   paused = value;
// };

// const useCompiler = () => {
//   const [result, setResult] = useState<
//     ResultType[]
//   >();

//   const writting = (text: string) => {
//     try {
//       if(paused) return;
//       const js = transpileTypeScript(text);
//       runCode(js).then((result) => {
//         setResult(result as ResultType[]);
//       });
//     } catch (ex) {
//       const { message, stack } = ex as Error;
//       setResult([
//         {
//           line: 1,
//           text: message || stack || JSON.stringify(ex),
//           time: 10,
//         },
//       ]);
//     }
//   };

//   return {
//     writting: debounce(writting, 500),
//     setPaused,
//     paused,
//     result,
//   };
// };

// export default useCompiler;

const listeners = new Set<(result: ResultType[]) => void>();
const pausedListeners = new Set<(paused: boolean) => void>();

let globalPaused = false;
let globalResult: ResultType[] = [];

const notifyAll = () => {
  listeners.forEach((listener) => listener(globalResult));
  pausedListeners.forEach((listener) => listener(globalPaused));
};

const setGlobalResult = (result: ResultType[]) => {
  globalResult = result;
  notifyAll();
};

const setPausedGlobal = (value: boolean) => {
  globalPaused = value;
  notifyAll();
};

const useCompiler = () => {
  const [result, setResult] = useState<ResultType[]>([]);
  const [paused, setPaused] = useState(false);

  const writting = (text: string, force?: boolean) => {
    try {
      if (text.length < 300) {
        localStorage.setItem("code", btoa(text));
      }

      if (paused && !force) return;

      const js = transpileTypeScript(text);
      runCode(js).then((result) => {
        setGlobalResult(result as ResultType[]);
      });
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

  const pause = (value: boolean) => {
    setPausedGlobal(value);

    console.log({value})

    if (!value) {
      const code = localStorage.getItem("code");

      console.log({code})
      if (code) {
        writting(atob(code), true);
      }
    }
  };

  useEffect(() => {
    const listener = (newResult: ResultType[]) => {
      setResult(newResult);
    };

    const pausedListener = (newPaused: boolean) => {
      setPaused(newPaused);
    };

    listeners.add(listener);
    pausedListeners.add(pausedListener);

    return () => {
      listeners.delete(listener);
      pausedListeners.delete(pausedListener);
    };
  }, []);

  return {
    writting: debounce(writting, 500),
    setPaused: pause,
    paused,
    result,
  };
};

export default useCompiler;
