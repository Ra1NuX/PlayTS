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
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-2">
                        <h2 className="text-xs font-semibold dark:text-gray-400 text-main-light/60 uppercase tracking-wide">
                          {t("DEPS_SEARCH_RESULTS")}
                        </h2>
                        <span className="text-xs dark:text-gray-500 text-main-light/60">
                          {t("DEPS_PACKAGES_COUNT", { count: info.objects.length })}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {info.objects.map((element) => (
                          <div 
                            key={element.package.name}
                            className="dark:bg-main-light bg-white rounded border border-gray-200 dark:border-divider-dark overflow-hidden transition-all duration-200"
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
                      <div className="pt-2 border-t border-gray-200 dark:border-divider-dark">
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
              <div className="space-y-2">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-xs font-semibold dark:text-gray-400 text-main-light/60 uppercase tracking-wide">
                    {t("DEPS_INSTALLED")}
                  </h2>
                  <span className="text-xs dark:text-gray-500 text-main-light/60">
                    {t("DEPS_PACKAGES_COUNT", { count: installedPackages.length })}
                  </span>
                </div>
                <div className="space-y-2">
                  {installedPackages.map(([name, version]) => (
                    <div 
                      key={name}
                      className="dark:bg-main-light bg-white rounded border border-gray-200 dark:border-divider-dark overflow-hidden transition-all duration-200"
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

