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
  { id: "gpt-5.2", name: "GPT-5.2", provider: "openai" },
  { id: "gpt-5.1", name: "GPT-5.1", provider: "openai" },
  { id: "gpt-4o", name: "GPT-4o", provider: "openai" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "openai" },
  { id: "o1", name: "O1", provider: "openai" },
  { id: "o3-mini", name: "O3 Mini", provider: "openai" },
];

export const FALLBACK_PROVIDERS: AiProviderOption[] = [
  { id: "openai", name: "OpenAI", models: OPENAI_FALLBACK },
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
