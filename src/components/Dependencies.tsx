import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import debounce from "../tools/debounce";
import useDependencies from "../hooks/useDependencies";
import Pagination from "./Pagination";
import { SidebarSection } from "./SidebarSection";
import { PackageCard } from "./dependencies/PackageCard";
import { InstalledPackageCard } from "./dependencies/InstalledPackageCard";
import { EmptyState } from "./dependencies/EmptyState";
import { LoadingSpinner } from "./dependencies/LoadingSpinner";

const Dependencies = () => {
  const { t } = useTranslation();
  const {
    search,
    totalPages,
    setPage,
    info,
    isLoading,
    packages,
    download
  } = useDependencies();

  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      search(value);
    }, 500),
    [search]
  );

  const handleSearchChange = useCallback((value: string) => {
    debouncedSearch(value);
  }, [debouncedSearch]);

  const installedPackages = Object.entries(packages);
  const hasInstalledPackages = installedPackages.length > 0;
  const hasSearchResults = info && info.objects.length > 0;

  return (
    <SidebarSection
      title={t("DEPENDENCIES")}
      count={installedPackages.length}
      searchPlaceholder={t("DEPS_SEARCH_PLACEHOLDER")}
      onSearchChange={handleSearchChange}
    >
        {info ? (
          <>
            {isLoading && <LoadingSpinner />}

            {!isLoading && (
              <>
                {hasSearchResults ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <h2 className="text-[11px] font-semibold uppercase tracking-wider dark:text-gray-400 text-gray-500">
                          {t("DEPS_SEARCH_RESULTS")}
                        </h2>
                        <span className="text-[11px] dark:text-gray-500 text-gray-400">
                          {t("DEPS_PACKAGES_COUNT", { count: info.objects.length })}
                        </span>
                      </div>
                      <div className="flex flex-col gap-3">
                        {info.objects.map((element) => (
                          <div
                            key={element.package.name}
                            className="dark:bg-[#1a1a1a] bg-white rounded-lg border dark:border-[#2a2a2a] border-gray-200 overflow-hidden hover:border-gray-300 dark:hover:border-[#333] transition-colors"
                          >
                            <PackageCard
                              name={element.package.name}
                              version={element.package.version}
                              description={element.package.description}
                              isInstalled={!!packages[element.package.name]}
                              isLoading={download.loadingPackages.has(element.package.name)}
                              onInstall={download.addPackage}
                              onUninstall={download.removePackage}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {totalPages > 1 && (
                      <div className="pt-3 border-t dark:border-[#2a2a2a] border-gray-200">
                        <Pagination
                          totalPages={totalPages}
                          onPageChange={(page) => setPage(page - 1)}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <EmptyState hasSearch={true} />
                )}
              </>
            )}
          </>
        ) : (
          <>
            {hasInstalledPackages ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-[11px] font-semibold uppercase tracking-wider dark:text-gray-400 text-gray-500">
                    {t("DEPS_INSTALLED")}
                  </h2>
                  <span className="text-[11px] dark:text-gray-500 text-gray-400">
                    {t("DEPS_PACKAGES_COUNT", { count: installedPackages.length })}
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {installedPackages.map(([name, version]) => (
                    <div
                      key={name}
                      className="dark:bg-[#1a1a1a] bg-white rounded-lg border dark:border-[#2a2a2a] border-gray-200 overflow-hidden hover:border-gray-300 dark:hover:border-[#333] transition-colors"
                    >
                      <InstalledPackageCard
                        name={name}
                        version={version}
                        isLoading={download.loadingPackages.has(name)}
                        onUninstall={download.removePackage}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState hasSearch={false} />
            )}
          </>
        )}
    </SidebarSection>
  );
};

export default Dependencies;
