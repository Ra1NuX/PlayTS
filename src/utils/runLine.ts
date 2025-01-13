const runLine = async (code: string) => {
  const worker = new Worker(new URL("../workers/worker.ts", import.meta.url), { type: "module" });
  worker.postMessage({ code });

  return new Promise((resolve) => {
    worker.onmessage = (event) => {
      resolve(event.data);
    };
  });
};

export default runLine;
