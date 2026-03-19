import { useCompilerStore } from '../stores/compilerStore';
import { STORAGE_KEYS } from '../constants/localStorage';

export type { ResultType } from '../stores/compilerStore';

// Backward-compatible exports for useGlobalBookmarks.ts and useGlobalEnvVars.ts
export const setGlobalBookmarksCode = (code: string, shouldRerun = false) => {
  useCompilerStore.getState().setBookmarksCode(code, shouldRerun);
};

export const setGlobalEnvVars = (envVars: Record<string, string>, shouldRerun = false) => {
  useCompilerStore.getState().setEnvVars(envVars, shouldRerun);
};

// For backward compat with callAI.ts
export const getGlobalCode = () => useCompilerStore.getState().code;

// Legacy export - kept as getter for callAI.ts backward compat
// (callAI.ts now uses getGlobalCode() or useCompilerStore directly)
export const globalCode = '';

const useCompiler = () => {
  const store = useCompilerStore();

  return {
    updateCode: store.updateAndRunCode,
    setPaused: (isPaused: boolean) => {
      store.setPaused(isPaused);
      if (!isPaused) {
        const savedCode = localStorage.getItem(STORAGE_KEYS.CODE);
        if (savedCode) {
          const decoded = atob(savedCode);
          store.updateAndRunCode(decoded).catch(console.error);
        }
      }
    },
    setCode: store.setCode,
    code: store.code,
    paused: store.paused,
    result: store.result,
  };
};

export default useCompiler;
