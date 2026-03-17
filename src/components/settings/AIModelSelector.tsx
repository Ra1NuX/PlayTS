import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { useTranslation } from "react-i18next";
import useSettings from "../../hooks/useSettings";
import useAiModels from "../../hooks/useAiModels";
import {
  getModelById,
  FALLBACK_PROVIDERS,
  type AiModelOption,
  type AiProviderId,
} from "../../constants/aiModels";

function getSelectedOption(
  providers: typeof FALLBACK_PROVIDERS,
  provider: string,
  modelId: string
): AiModelOption | { id: string; name: string; provider: AiProviderId } {
  const found = getModelById(providers, provider as AiProviderId, modelId);
  if (found) return found;
  const p = providers.find((x) => x.id === provider);
  return {
    id: modelId,
    name: modelId,
    provider: provider as AiProviderId,
  };
}

const AIModelSelector = () => {
  const { t } = useTranslation();
  const { settings, changeSettings } = useSettings();
  const { providers, loading } = useAiModels(settings.apiKey);

  const selectedOption = getSelectedOption(
    providers,
    settings.aiProvider,
    settings.aiModelId
  );

  const handleChange = (option: AiModelOption) => {
    changeSettings({
      aiProvider: option.provider,
      aiModelId: option.id,
    });
  };

  return (
    <div className="flex flex-row gap-5 justify-between items-center dark:text-gray-100 text-gray-900 text-sm">
      {t("MODEL")}
      <Listbox value={selectedOption} onChange={handleChange}>
        <ListboxButton className="h-9 px-3 text-sm rounded-lg border dark:border-[#2a2a2a] border-gray-200 dark:bg-[#111] bg-gray-50 dark:text-gray-100 text-gray-900 flex items-center justify-center min-w-[160px] cursor-pointer hover:border-gray-300 dark:hover:border-[#333] transition-colors focus:ring-2 focus:ring-accent-dark/30 focus:border-accent-dark outline-none">
          {loading ? (
            <span className="dark:text-gray-500 text-gray-400">...</span>
          ) : (
            selectedOption.name
          )}
        </ListboxButton>
        <ListboxOptions
          anchor="bottom"
          className="z-20 dark:bg-[#1a1a1a] bg-white border dark:border-[#2a2a2a] border-gray-200 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto"
        >
          {providers.map((provider) => (
            <div key={provider.id}>
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider dark:text-gray-500 text-gray-400 border-b dark:border-[#2a2a2a] border-gray-100">
                {provider.name}
              </div>
              {provider.models.map((model) => (
                <ListboxOption
                  key={`${model.provider}-${model.id}`}
                  value={model}
                  className="data-[focus]:bg-accent-dark/10 dark:data-[focus]:bg-accent-dark/20 px-3 py-2 flex gap-2 dark:text-gray-100 text-gray-900 cursor-pointer transition-colors justify-between min-w-[160px] text-sm"
                >
                  {model.name}
                </ListboxOption>
              ))}
            </div>
          ))}
        </ListboxOptions>
      </Listbox>
    </div>
  );
};

export default AIModelSelector;
