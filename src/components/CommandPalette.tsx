import { KBarAnimator, KBarPortal, KBarPositioner, KBarResults, KBarSearch, useKBar, useMatches } from "kbar";
import { useTranslation } from "react-i18next";
import type { Key } from "../model/kbd";
import Kbd from "./chat/Kbd";

const kbarShortcutToKeys = (shortcut: string[] | undefined): Key[] => {
  if (!shortcut?.length) return [];
  const parts = shortcut[0].split("+");
  return parts.map((s) => (s === "$mod" ? "Control" : s)) as Key[];
};

const filterToRootOnly = (
  items: (string | { parent?: string })[]
): (string | { parent?: string })[] => {
  const filtered: (string | { parent?: string })[] = [];
  let pendingSection: string | null = null;
  for (const item of items) {
    if (typeof item === "string") {
      pendingSection = item;
    } else if (!item.parent) {
      if (pendingSection !== null) {
        filtered.push(pendingSection);
        pendingSection = null;
      }
      filtered.push(item);
    }
  }
  return filtered;
};

const CommandPalette = () => {
  const { t } = useTranslation();
  const { results } = useMatches();
  const { currentRootActionId } = useKBar((state) => ({
    currentRootActionId: state.currentRootActionId,
  }));
  const displayResults =
    currentRootActionId != null ? results : filterToRootOnly(results);

  return (
    <KBarPortal>
      <KBarPositioner className="z-50 bg-black/40 backdrop-blur-[1px]">
        <KBarAnimator className="w-full max-w-xl overflow-hidden rounded-xl border border-gray-300 bg-[#f7f7f7] shadow-2xl dark:border-divider-dark dark:bg-main-light">
          <KBarSearch
            key={currentRootActionId ?? "root"}
            className="h-12 w-full border-b border-gray-300 bg-transparent px-4 text-sm text-main-dark outline-none placeholder:text-main-dark/50 dark:border-divider-dark dark:text-white dark:placeholder:text-white/50"
            defaultPlaceholder={t("CMD_PLACEHOLDER")}
          />
          <div className="overflow-hidden p-2">
            {displayResults.length > 0 ? (
              <KBarResults
                maxHeight={288}
                items={displayResults}
                onRender={({ item, active }) =>
                  typeof item === "string" ? (
                    <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-main-dark/60 dark:text-white/50">
                      {item}
                    </div>
                  ) : (
                    <div
                      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${active ? "bg-gray-300 text-main-dark dark:bg-main-contrast dark:text-white" : "text-main-dark/80 dark:text-white/80"}`}
                    >
                      {item.icon ? (
                        <span className="flex shrink-0 text-current opacity-80">{item.icon}</span>
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <p>{item.name}</p>
                        {item.subtitle ? <p className="text-xs opacity-70">{item.subtitle}</p> : null}
                      </div>
                      {item.shortcut?.length ? (
                        <span className="shrink-0">
                          <Kbd keys={kbarShortcutToKeys(item.shortcut)} />
                        </span>
                      ) : null}
                    </div>
                  )
                }
              />
            ) : (
              <div className="px-3 py-6 text-center text-sm text-main-dark/60 dark:text-white/60">
                {t("CMD_EMPTY")}
              </div>
            )}
          </div>
        </KBarAnimator>
      </KBarPositioner>
    </KBarPortal>
  );
};

export default CommandPalette;
