// Re-export from refactored location for backwards compatibility
export type { CallAIStreamCallbacks } from "./ai/types";
export { callAIProvider as callOpenAI } from "./ai/baseProvider";

// To call OpenAI specifically, use:
//   import { openaiConfig } from "./ai/openaiProvider";
//   import { callAIProvider } from "./ai/baseProvider";
//   callAIProvider(openaiConfig, params, callbacks);
