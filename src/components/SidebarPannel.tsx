import { ChangeEvent, useCallback, useMemo } from "react";
import debounce from "../tools/debounce";
import DownloadPackageButton from "./DownloadPackageButton";
import { BiSolidStar } from "react-icons/bi";
import { useTranslation } from "react-i18next";
import useDependencies from "../hooks/useDependencies";
import Pagination from "./Pagination";

export const DependenciesPanel = () => {
  const { t } = useTranslation();

  const { search, totalPages, setPage, info, isLoading, packages} = useDependencies();

  console.log({packages})
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        search(value);
      }, 500),
    []
  );

  const searchFunction = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    debouncedSearch(value);
  }, []);

  return (
    <>
      <h1 className="dark:text-gray-300 font-semibold text-2xl text-center">
        {t("DEPENDENCIES")}
      </h1>
      <input
        type="search"
        name="dependencies"
        id="dependencies"
        autoCorrect="off"
        className="dark:bg-main-light dark:text-white shadow-md p-2 flex m-2 mx-auto w-full rounded-lg font-normal"
        onChange={searchFunction}
      />

      {info ? (
        <>
          <section className="flex flex-1 flex-col h-auto overflow-y-auto gap-2">
            {isLoading && (
              <div className="flex justify-center items-center">
                <svg
                  className="animate-spin h-5 w-5 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    strokeWidth="4"
                    stroke="currentColor"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v2a6 6 0 100 12v2a8 8 0 01-8-8z"
                  />
                </svg>
              </div>
            )}

            {!isLoading &&
              info.objects.map((element) => {
                return (
                  <div
                    key={element.package.name}
                    className="p-2 flex w-full justify-between items-center rounded-lg"
                  >
                    <h2 className="dark:text-gray-300 text-main-dark font-semibold  flex flex-col text-left w-1/2 break-words">
                      {element.package.name}
                      <span className="dark:text-gray-500 text-main-light/60 font-semibold text-start text-xs">
                        {element.package.version}
                      </span>
                    </h2>
                    <DownloadPackageButton
                      pckg={element.package.name}
                      version={element.package.version}
                    />
                  </div>
                );
              })}
          </section>
          <Pagination
            totalPages={totalPages}
            onPageChange={(page) => {
              setPage(page - 1);
            }}
          />
        </>
      ) : (
        <>
          {packages &&
          Object.keys(packages).length > 0 ? (
            <h2 className="dark:text-gray-300 font-semibold flex flex-col text-left pt-4">
              <span className="flex items-center gap-2 px-2">
                <BiSolidStar color="#d8e548" /> {t("INSTALLED_DEPENDENCIES")}:
              </span>
              {Object.entries(packages).map(([pckg, version]) => {
                return (
                  <div
                    key={pckg + version}
                    className="px-2 flex m-2 mx-auto w-full rounded-lg justify-between items-center"
                  >
                    <h2 className="dark:text-gray-300 font-semibold  flex flex-col text-left">
                      {pckg}
                      <span className="dark:text-gray-500 font-semibold text-start text-xs">
                        {version}
                      </span>
                    </h2>
                    <DownloadPackageButton pckg={pckg} version={version} />
                  </div>
                );
              })}
            </h2>
          ) : (
            <h2 className="dark:text-gray-600 font-semibold pt-4 flex flex-col text-center italic">
              {t("NO_DEPENDENCIES_INSTALLED")}
            </h2>
          )}
        </>
      )}
    </>
  );
};
