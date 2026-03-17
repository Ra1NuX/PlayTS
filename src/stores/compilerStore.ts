import { create } from 'zustand';
import transpileTypeScript from '../tools/convertToJS';
import { executeCode } from '../utils/codeExecution';
import { generateGlobalBookmarkCode } from '../utils/bookmarkInjection';
import { STORAGE_KEYS } from '../constants/localStorage';
import { useDependenciesStore } from './dependenciesStore';

export interface ResultType {
  line: number;
  text: string;
  time: number;
}

interface CompilerState {
  code: string;
  result: ResultType[];
  paused: boolean;
  bookmarksCode: string;
  envVars: Record<string, string>;
  setCode: (code: string) => void;
  setResult: (result: ResultType[]) => void;
  setPaused: (paused: boolean) => void;
  setBookmarksCode: (code: string, shouldRerun?: boolean) => void;
  setEnvVars: (envVars: Record<string, string>, shouldRerun?: boolean) => void;
  updateAndRunCode: (code: string) => Promise<void>;
}

const DEFAULT_CODE = `// Welcome to PlayTS!
// Write your JavaScript/TypeScript code here and run it

console.log('Hello world from PlayTS!');

// Examples of what you can do:
// - Execute JavaScript/TypeScript code
// - Install npm packages
// - Use global bookmarks
// - See results aligned with your code

// Try writing something here and press the run button`;

let executionId = 0;

const initializeEnvVarsFromStorage = (): Record<string, string> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ENV_VARS_STORAGE);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.state?.envVars) {
        const active = parsed.state.envVars.filter((ev: { isActive: boolean }) => ev.isActive);
        const record: Record<string, string> = {};
        active.forEach((ev: { key: string; value: string }) => {
          record[ev.key] = ev.value;
        });
        return record;
      }
    }
  } catch (error) {
    console.error('Error initializing env vars:', error);
  }
  return {};
};

const initializeBookmarksFromStorage = (): string => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BOOKMARKS_STORAGE);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.state?.bookmarks) {
        const bookmarks = parsed.state.bookmarks.map((b: any) => ({
          ...b,
          createdAt: new Date(b.createdAt),
        }));

        const activeBookmarks = bookmarks.filter((b: any) => b.isGloballyActive);

        if (activeBookmarks.length > 0) {
          return generateGlobalBookmarkCode(activeBookmarks);
        }
      }
    }
  } catch (error) {
    console.error('Error initializing bookmarks:', error);
  }
  return '';
};

const loadCodeFromStorage = (): string => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CODE);
    if (saved) return atob(saved);
  } catch {
    console.error('Error loading code from storage');
  }
  return DEFAULT_CODE;
};

export const useCompilerStore = create<CompilerState>()((set, get) => ({
  code: loadCodeFromStorage(),
  result: [],
  paused: false,
  bookmarksCode: initializeBookmarksFromStorage(),
  envVars: initializeEnvVarsFromStorage(),

  setCode: (code: string) => {
    set({ code });
    if (code.length < 300) localStorage.setItem(STORAGE_KEYS.CODE, btoa(code));
  },

  setResult: (result: ResultType[]) => {
    set({ result });
  },

  setPaused: (paused: boolean) => {
    set({ paused });
  },

  setBookmarksCode: (code: string, shouldRerun = false) => {
    set({ bookmarksCode: code });
    const state = get();
    if (shouldRerun && !state.paused && state.code) {
      get().updateAndRunCode(state.code).catch(console.error);
    }
  },

  setEnvVars: (envVars: Record<string, string>, shouldRerun = false) => {
    set({ envVars });
    const state = get();
    if (shouldRerun && !state.paused && state.code) {
      get().updateAndRunCode(state.code).catch(console.error);
    }
  },

  updateAndRunCode: async (code: string) => {
    get().setCode(code);
    if (get().paused) return;

    const currentExecutionId = ++executionId;

    try {
      const js = transpileTypeScript(code);
      const state = get();
      const dependencies = useDependenciesStore.getState().packages;
      const result = await executeCode({
        code: js,
        globalBookmarksCode: state.bookmarksCode,
        dependencies,
        envVars: state.envVars,
      });

      if (currentExecutionId !== executionId) return;

      set({ result: result as ResultType[] });
    } catch (ex) {
      if (currentExecutionId !== executionId) return;

      const { message, stack } = ex as Error;
      set({
        result: [
          {
            line: 1,
            text: message || stack || JSON.stringify(ex),
            time: 10,
          },
        ],
      });
    }
  },
}));
