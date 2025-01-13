import { useState } from "react";
import debounce from "../tools/debounce";
import transpileTypeScript from "../tools/convertToJS";
import runLine from "../utils/runLine";

const useCompiler = () => {
  const [result, setResult] = useState<
    {
      line: number;
      text: string;
      time: number;
    }[]
  >();

  const writting = (text: string) => {
    try {
      const js = transpileTypeScript(text);
      runLine(js).then((result) => {
        setResult(result);
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
    result,
  };
};

export default useCompiler;
