import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const models = [
  { key: "gpt-4o", name: "GPT-4o" },
  { key: "mistral", name: "Mistral" },
];

const AIModelSelector = () => {
  const { t } = useTranslation();

  const [selectedModel, setSelectedModel] = useState(models[0]);

  return (
    <div className="flex flex-row gap-5 justify-between items-center">
      {t("MODEL")}
      <Listbox
        value={selectedModel}
        onChange={(value) => {
          setSelectedModel(value);
        }}
      >
        <ListboxButton className="font-[roboto] font-normal dark:bg-main-dark/50 bg-[#fafafa] dark:hover:bg-main-dark hover:bg-[#f0f0f0] border shadow-md dark:border-main-dark/20 p-1 pr-2 rounded-xl flex justify-center min-w-[110px] text-center">
          {selectedModel.name}
        </ListboxButton>
        <ListboxOptions
          anchor="bottom"
          className="z-20 dark:bg-main-light bg-[#f7f7f7] shadow-2xl border border-main-dark/20 rounded-lg mt-2 font-[roboto] font-normal"
        >
          {models.map((model) => (
            <ListboxOption
              key={model.key}
              value={model}
              className="dark:data-[focus]:bg-main-dark/80 p-2 flex gap-2 dark:text-white cursor-pointer hover:bg-main-light/20 justify-between min-w-[110px]"
            >
              {model.name}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
    </div>
  );
};

export default AIModelSelector;
