import type { AiModelOption, AiProviderId } from "../constants/aiModels";

const OPENAI_CHAT_CODE_BLOCKLIST = [
  "audio",
  "realtime",
  "image",
  "tts",
  "transcribe",
  "whisper",
  "embedding",
  "moderation",
  "dall-e",
  "davinci-002",
  "babbage-002",
  "search",
  "deep-research",
  "computer-use",
  "omni-moderation",
];

function isBlocked(id: string): boolean {
  if (id === "codex-mini-latest") return true;
  const lower = id.toLowerCase();
  return OPENAI_CHAT_CODE_BLOCKLIST.some((term) => lower.includes(term));
}

function isOpenAIChatModel(id: string): boolean {
  return ["gpt-", "o1", "o3", "o4"].some((p) => id.startsWith(p) || id === p);
}

function isOpenAICodeModel(id: string): boolean {
  return (
    id.toLowerCase().includes("codex") ||
    id.startsWith("code-")
  );
}

export function isOpenAICodeOrChatModel(id: string): boolean {
  if (isBlocked(id)) return false;
  return isOpenAICodeModel(id) || isOpenAIChatModel(id);
}

export function isOpenAIChatCompletionsModel(id: string): boolean {
  if (isBlocked(id)) return false;
  if (isOpenAICodeModel(id)) return false;
  return isOpenAIChatModel(id);
}

export async function fetchOpenAIModels(apiKey: string): Promise<AiModelOption[]> {
  const res = await fetch("https://api.openai.com/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { data: { id: string; created?: number }[] };
  const filtered = (data.data ?? []).filter((m) => isOpenAIChatCompletionsModel(m.id));
  filtered.sort((a, b) => (b.created ?? 0) - (a.created ?? 0));
  const models: AiModelOption[] = filtered.map((m) => ({
    id: m.id,
    name: m.id,
    provider: "openai" as AiProviderId,
  }));
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
