import { ChangeEvent, useEffect, useState } from "react";
import { NpmSearchResponse } from "../model/npm";
import debounce from "../tools/debounce";
import DownloadPackageButton from "./DownloadPackageButton";
import { BiSolidStar } from "react-icons/bi";
import { useTranslation } from "react-i18next";

export const DependenciesPanel = () => {
  const [search, setSearch] = useState<string | null>(null);
  const [info, setInfo] = useState<NpmSearchResponse | null>(null);

  const { t } = useTranslation();

  const [installedDependecies, setInstalledDependencies] = useState<{
    [x: string]: string;
  } | null>(null);

  const searchFunction = debounce((e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, 1000);

  useEffect(() => {
    setInstalledDependencies(
      JSON.parse(localStorage.getItem("dependencies") || "{}")
    );
  }, []);

  useEffect(() => {
    if (!search || search.length <= 1) return;

    fetch(`https://registry.npmjs.org/-/v1/search?text=${search}&size=20`)
      .then((response) => response.json())
      .then((data: NpmSearchResponse) => {
        setInfo(data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        // Reset search input after fetching
        setSearch(null);
      }
      );
  }, [search]);

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
        onChange={(e) => {
          searchFunction(e);
        }}
      />
      <section className="flex flex-1 flex-col h-auto overflow-y-auto gap-2">
        {search ? (
          info?.objects.map((element) => {
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
          })
        ) : (
          <>
            {installedDependecies &&
            Object.keys(installedDependecies).length > 0 ? (
              <h2 className="dark:text-gray-300 font-semibold flex flex-col text-left pt-4">
                <span className="flex items-center gap-2 px-2">
                  <BiSolidStar color="#d8e548" />{" "}
                  {t("INSTALLED_DEPENDENCIES")}:
                </span>
                {Object.entries(installedDependecies).map(([pckg, version]) => {
                  return (
                    <div key={pckg+version} className="px-2 flex m-2 mx-auto w-full rounded-lg justify-between items-center">
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
      </section>
    </>
  );
};
