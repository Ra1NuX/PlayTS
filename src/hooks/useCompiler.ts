import { useState } from "react";
import debounce from "../tools/debounce";
import transpileTypeScript from "../tools/convertToJS";
import runCode from "../utils/runCode";

interface ResultType {
  line: number;
  text: string;
  time: number;
}

let paused = false;

const setPaused = (value: boolean) => {
  console.log("paused", value);
  paused = value;
};

const useCompiler = () => {
  const [result, setResult] = useState<
    ResultType[]
  >();


  const writting = (text: string) => {
    try {
      if(paused) return;
      const js = transpileTypeScript(text);
      runCode(js).then((result) => {
        setResult(result as ResultType[]);
      });
    } catch (ex) {
      const { message, stack } = ex as Error;
      setResult([
        {
          line: 1,
          text: message || stack || JSON.stringify(ex),
          time: 10,
        },
      ]);
    }
  };


  return {
    writting: debounce(writting, 500),
    setPaused,
    paused,
    result,
  };
};

export default useCompiler;
