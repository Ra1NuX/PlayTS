export type AiProviderId = "openai" | "google" | "anthropic";

export interface AiModelOption {
  id: string;
  name: string;
  provider: AiProviderId;
}

export interface AiProviderOption {
  id: AiProviderId;
  name: string;
  models: AiModelOption[];
}

const OPENAI_FALLBACK: AiModelOption[] = [
  { id: "gpt-4o", name: "GPT-4o", provider: "openai" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "openai" },
  { id: "o1", name: "O1", provider: "openai" },
  { id: "o3-mini", name: "O3 Mini", provider: "openai" },
];

const GOOGLE_FALLBACK: AiModelOption[] = [
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "google" },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "google" },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "google" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "google" },
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", provider: "google" },
];

const ANTHROPIC_FALLBACK: AiModelOption[] = [
  { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4", provider: "anthropic" },
  { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", provider: "anthropic" },
  { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku", provider: "anthropic" },
  { id: "claude-3-opus-20240229", name: "Claude 3 Opus", provider: "anthropic" },
];

export const FALLBACK_PROVIDERS: AiProviderOption[] = [
  { id: "openai", name: "OpenAI", models: OPENAI_FALLBACK },
  { id: "google", name: "Google (Gemini)", models: GOOGLE_FALLBACK },
  { id: "anthropic", name: "Anthropic (Claude)", models: ANTHROPIC_FALLBACK },
];

export const DEFAULT_AI_PROVIDER: AiProviderId = "openai";
export const DEFAULT_AI_MODEL_ID = "gpt-4o";

export function getModelById(
  providers: AiProviderOption[],
  provider: AiProviderId,
  modelId: string
): AiModelOption | undefined {
  const option = providers.find((p) => p.id === provider);
  return option?.models.find((m) => m.id === modelId);
}

export function getDefaultModel(providers: AiProviderOption[]): AiModelOption {
  const model = getModelById(providers, DEFAULT_AI_PROVIDER, DEFAULT_AI_MODEL_ID);
  return model ?? providers[0]?.models[0] ?? FALLBACK_PROVIDERS[0].models[0];
}

export function getAllModels(providers: AiProviderOption[]): AiModelOption[] {
  return providers.flatMap((p) => p.models);
}

export function parseLegacyAiModel(
  value: string | null,
  providers: AiProviderOption[] = FALLBACK_PROVIDERS
): { provider: AiProviderId; modelId: string } | null {
  if (!value) return null;
  const all = getAllModels(providers);
  const found = all.find((m) => m.id === value);
  if (found) return { provider: found.provider, modelId: found.id };
  return null;
}
