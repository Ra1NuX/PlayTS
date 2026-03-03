import { useState, useEffect, useCallback } from "react";
import type { AiProviderId, AiProviderOption } from "../constants/aiModels";
import { FALLBACK_PROVIDERS } from "../constants/aiModels";
import { fetchOpenAIModels, fetchGoogleModels } from "../utils/fetchAiModels";

function mergeProviders(
  fallback: AiProviderOption[],
  fetched: Partial<Record<AiProviderId, AiProviderOption["models"]>>
): AiProviderOption[] {
  return fallback.map((p) => {
    const models = fetched[p.id];
    return {
      ...p,
      models: models && models.length > 0 ? models : p.models,
    };
  });
}

export function useAiModels(apiKey: string) {
  const [providers, setProviders] = useState<AiProviderOption[]>(() =>
    FALLBACK_PROVIDERS.map((p) => ({ ...p, models: [...p.models] }))
  );
  const [loading, setLoading] = useState<Record<AiProviderId, boolean>>({
    openai: false,
    google: false,
    anthropic: false,
  });

  const refetch = useCallback(() => {
    if (!apiKey.trim()) return;

    setLoading((prev) => ({ ...prev, openai: true, google: true }));

    Promise.all([
      fetchOpenAIModels(apiKey).then((models) => ({ openai: models })),
      fetchGoogleModels(apiKey).then((models) => ({ google: models })),
    ]).then(([openaiResult, googleResult]) => {
      const fetched: Partial<Record<AiProviderId, AiProviderOption["models"]>> = {
        ...openaiResult,
        ...googleResult,
      };
      setProviders((prev) => mergeProviders(FALLBACK_PROVIDERS, fetched));
      setLoading((prev) => ({ ...prev, openai: false, google: false }));
    }).catch(() => {
      setLoading((prev) => ({ ...prev, openai: false, google: false }));
    });
  }, [apiKey]);

  useEffect(() => {
    if (!apiKey.trim()) return;
    refetch();
  }, [apiKey, refetch]);

  return { providers, loading, refetch };
}

export default useAiModels;
