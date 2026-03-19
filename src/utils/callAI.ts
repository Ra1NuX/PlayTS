import { t } from "i18next";
import { useSettingsStore } from "../stores/settingsStore";
import { useCompilerStore } from "../stores/compilerStore";
import { useAuthStore } from "../stores/authStore";
import { useEntitlementStore } from "../stores/entitlementStore";
import { callAIProvider } from "./ai/baseProvider";
import { openaiConfig } from "./ai/openaiProvider";
import { anthropicConfig } from "./ai/anthropicProvider";
import { geminiConfig } from "./ai/geminiProvider";
import { callAIProxy } from "./ai/proxyProvider";
import type { CallAIStreamCallbacks, AIProviderConfig } from "./ai/types";

export type { CallAIStreamCallbacks };

const PROVIDER_CONFIGS: Record<string, AIProviderConfig> = {
  openai: openaiConfig,
  anthropic: anthropicConfig,
  google: geminiConfig,
};

function buildSystemContent(): string {
  const settings = useSettingsStore.getState();
  const code = useCompilerStore.getState().code;
  return (
    t("SYSTEM_CONTEXT") +
    " " +
    t("SYSTEM_MESSAGE_CONTEXT", {
      code,
      name: settings.name,
      email: settings.email,
    })
  );
}

export async function callAI(
  messages: { role: string; content: string }[],
  callbacks: CallAIStreamCallbacks
) {
  const systemContent = buildSystemContent();
  const { apiKey, aiModelId, aiProvider } = useSettingsStore.getState();

  const hasOwnKey = !!apiKey?.trim();
  const userId = useAuthStore.getState().userId;
  const hasAiProxy = useEntitlementStore.getState().hasFeature('ai_proxy');
  const canUseProxy = !!userId && hasAiProxy;

  console.log("[callAI]", {
    hasOwnKey,
    canUseProxy,
    provider: aiProvider,
    model: aiModelId,
  });

  // Priority 1: User has their own API key — use it directly
  if (hasOwnKey) {
    const config = PROVIDER_CONFIGS[aiProvider] ?? PROVIDER_CONFIGS.openai;
    const format = aiProvider === "google" ? "json" : "sse";
    return callAIProvider(
      config,
      { modelId: aiModelId, apiKey, messages, systemContent },
      callbacks,
      { format }
    );
  }

  // Priority 2: Pro user without key — use server proxy
  if (canUseProxy) {
    return callAIProxy(aiProvider || "openai", aiModelId, messages, systemContent, callbacks);
  }

  // No key and no proxy access
  console.warn("[callAI] No API key and no proxy access");
  callbacks.onFinally({
    response: "",
    error: true,
    id: null,
  });
}
