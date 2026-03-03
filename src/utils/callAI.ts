import { t } from "i18next";
import { globalSettings } from "../hooks/useSettings";
import { globalCode } from "../hooks/useCompiler";
import { callOpenAI } from "./callOpenAI";
import { callGemini } from "./callGemini";
import { callAnthropic } from "./callAnthropic";
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
  const { apiKey, aiProvider, aiModelId } = globalSettings;

  if (aiProvider === "openai") {
    await callOpenAI(aiModelId, apiKey, messages, systemContent, callbacks);
    return;
  }

  if (aiProvider === "google") {
    await callGemini(aiModelId, apiKey, messages, systemContent, callbacks);
    return;
  }

  if (aiProvider === "anthropic") {
    await callAnthropic(aiModelId, apiKey, messages, systemContent, callbacks);
    return;
  }

  callbacks.onFinally({
    response: "",
    code: "",
    error: true,
    id: null,
  });
}
