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
    <div className="flex flex-row gap-5 justify-between items-center">
      {t("MODEL")}
      <Listbox value={selectedOption} onChange={handleChange}>
        <ListboxButton className="font-[roboto] font-normal dark:bg-main-dark/50 bg-[#fafafa] dark:hover:bg-main-dark hover:bg-[#f0f0f0] border shadow-md dark:border-main-dark/20 p-1 pr-2 rounded-xl flex justify-center min-w-[140px] text-center">
          {loading.openai || loading.google ? (
            <span className="opacity-70">...</span>
          ) : (
            selectedOption.name
          )}
        </ListboxButton>
        <ListboxOptions
          anchor="bottom"
          className="z-20 dark:bg-main-light bg-[#f7f7f7] shadow-2xl border border-main-dark/20 rounded mt-2 font-[roboto] font-normal max-h-60 overflow-y-auto"
        >
          {providers.map((provider) => (
            <div key={provider.id}>
              <div className="px-2 py-1 text-xs font-semibold text-main-dark/70 dark:text-white/70 border-b border-main-dark/10 dark:border-white/10">
                {provider.name}
              </div>
              {provider.models.map((model) => (
                <ListboxOption
                  key={`${model.provider}-${model.id}`}
                  value={model}
                  className="dark:data-[focus]:bg-main-dark/80 p-2 flex gap-2 dark:text-white cursor-pointer hover:bg-main-light/20 justify-between min-w-[140px]"
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
