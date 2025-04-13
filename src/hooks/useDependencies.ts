import { useEffect, useState } from "react";
import { InstalledPackages, NpmSearchResponse } from "../model/npm";
import { installPackage, uninstallPackage } from "../utils/runCode";

const querySize = 20;

const listeners = new Set<(result: InstalledPackages) => void>();

const defaultDependencies = {
  ...JSON.parse(localStorage.getItem("dependencies") || "{}"),
};

export let globalDependencies = defaultDependencies;

const notifyAll = () => {
  listeners.forEach((listener) => listener(globalDependencies));
};

const setGlobalDependencies = (dependencies: InstalledPackages[]) => {
  globalDependencies = dependencies;
  localStorage.setItem("dependencies", JSON.stringify(dependencies));
  notifyAll();
};

const useDependencies = () => {
  const [info, setInfo] = useState<NpmSearchResponse | null>(null);
  const [text, setText] = useState<string>("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] =
    useState<InstalledPackages>(globalDependencies);

  useEffect(() => {
    const listener = (newPackages: InstalledPackages) =>
      setPackages(newPackages);

    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    search(text, page);
  }, [page]);

  const search = async (text: string, searchPage?: number) => {
    setText(text);
    if (!text || text.length <= 1) {
      setInfo(null);
      return;
    }
    setIsLoading(true);

    const response = await fetch(
      `https://registry.npmjs.org/-/v1/search?text=${text}&size=${querySize}&from=${
        (searchPage ?? page) * querySize
      }`
    );
    const data: NpmSearchResponse = await response.json();
    if (!data) return;
    setTotalPages(Math.ceil(data.total / querySize));
    setInfo(data);
    setIsLoading(false);
  };

  const addPackage = async (pckg: string, version: string) => {
    setLoading(true);
    const isInstalled = await installPackage(pckg, version);
    if (isInstalled) {
      const dependencies = { ...globalDependencies, [pckg]: version };
      setGlobalDependencies(dependencies);
    }
    setLoading(false);
  };

  const removePackage = async (pckg: string) => {
    setLoading(true);
    const dependencies = { ...globalDependencies };

    const ok = await uninstallPackage(pckg);
    if (ok) {
      delete dependencies[pckg];
      setGlobalDependencies(dependencies);
    }
    setLoading(false);
  };

  return {
    setPage,
    totalPages,
    search,
    info,
    isLoading,
    packages,
    download: {
      loading,
      addPackage,
      removePackage,
    },
  };
};

export default useDependencies;
