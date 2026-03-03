import { t } from "i18next";
import { globalSettings } from "../hooks/useSettings";
import { globalCode } from "../hooks/useCompiler";
import { callOpenAI } from "./callOpenAI";
import type { CallAIStreamCallbacks } from "./callOpenAI";

function buildSystemContent(): string {
  return (
    t("SYSTEM_CONTEXT") +
    " " +
    t("SYSTEM_MESSAGE_CONTEXT", {
      code: globalCode,
      name: globalSettings.name,
      email: globalSettings.email,
    })
  );
}

export async function callAI(
  messages: { role: string; content: string }[],
  callbacks: CallAIStreamCallbacks
) {
  const systemContent = buildSystemContent();
  const { apiKey, aiModelId } = globalSettings;
  console.log("[callAI] entry", {
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey?.length ?? 0,
    aiModelId,
    messagesCount: messages.length,
    lastMessageRole: messages[messages.length - 1]?.role,
  });
  if (!apiKey?.trim()) {
    console.warn("[callAI] no apiKey, skipping");
    callbacks.onFinally({
      response: "",
      code: "",
      error: true,
      id: null,
    });
    return;
  }
  await callOpenAI(aiModelId, apiKey, messages, systemContent, callbacks);
}
