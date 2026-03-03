import type { AiModelOption, AiProviderId } from "../constants/aiModels";

const OPENAI_CHAT_PREFIXES = ["gpt-", "o1", "o3"];

function isOpenAIChatModel(id: string): boolean {
  return OPENAI_CHAT_PREFIXES.some((p) => id.startsWith(p) || id === p);
}

export async function fetchOpenAIModels(apiKey: string): Promise<AiModelOption[]> {
  const res = await fetch("https://api.openai.com/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { data: { id: string }[] };
  const models = (data.data ?? [])
    .filter((m) => isOpenAIChatModel(m.id))
    .map((m) => ({ id: m.id, name: m.id, provider: "openai" as AiProviderId }));
  return models.length > 0 ? models : [];
}

export async function fetchGoogleModels(apiKey: string): Promise<AiModelOption[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`
  );
  if (!res.ok) return [];
  const data = (await res.json()) as { models?: { name: string; displayName?: string }[] };
  const list = data.models ?? [];
  const prefix = "models/";
  const models: AiModelOption[] = list
    .filter((m) => m.name?.startsWith(prefix))
    .map((m) => ({
      id: m.name!.slice(prefix.length),
      name: m.displayName ?? m.name!.slice(prefix.length),
      provider: "google" as AiProviderId,
    }));
  return models;
}
