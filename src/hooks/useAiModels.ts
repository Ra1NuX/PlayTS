import { useState, useEffect, useCallback } from "react";
import type { AiProviderOption } from "../constants/aiModels";
import { FALLBACK_PROVIDERS } from "../constants/aiModels";
import { fetchOpenAIModels } from "../utils/fetchAiModels";

function mergeProviders(
  fallback: AiProviderOption[],
  fetched: AiProviderOption["models"] | null
): AiProviderOption[] {
  return fallback.map((p) => ({
    ...p,
    models: fetched && fetched.length > 0 ? fetched : p.models,
  }));
}

export function useAiModels(apiKey: string) {
  const [providers, setProviders] = useState<AiProviderOption[]>(() =>
    FALLBACK_PROVIDERS.map((p) => ({ ...p, models: [...p.models] }))
  );
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(() => {
    if (!apiKey.trim()) return;

    setLoading(true);

    fetchOpenAIModels(apiKey)
      .then((models) => {
        setProviders((prev) => mergeProviders(FALLBACK_PROVIDERS, models));
      })
      .finally(() => setLoading(false));
  }, [apiKey]);

  useEffect(() => {
    if (!apiKey.trim()) return;
    refetch();
  }, [apiKey, refetch]);

  return { providers, loading, refetch };
}

export default useAiModels;
