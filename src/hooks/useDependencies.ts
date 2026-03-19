import { useEffect, useState } from 'react';
import { NpmSearchResponse } from '../model/npm';
import { useDependenciesStore } from '../stores/dependenciesStore';

const querySize = 20;

// Backward compat export - now reads from store
export const getGlobalDependencies = () => useDependenciesStore.getState().packages;

// Legacy mutable-like export using a getter proxy
export const globalDependencies: Record<string, string> = new Proxy({} as Record<string, string>, {
  get(_target, prop: string) {
    return useDependenciesStore.getState().packages[prop];
  },
  ownKeys() {
    return Object.keys(useDependenciesStore.getState().packages);
  },
  getOwnPropertyDescriptor(_target, prop: string) {
    const packages = useDependenciesStore.getState().packages;
    if (prop in packages) {
      return { configurable: true, enumerable: true, value: packages[prop] };
    }
    return undefined;
  },
  has(_target, prop: string) {
    return prop in useDependenciesStore.getState().packages;
  },
});

const useDependencies = () => {
  const packages = useDependenciesStore((s) => s.packages);
  const loadingPackages = useDependenciesStore((s) => s.loadingPackages);
  const addPackage = useDependenciesStore((s) => s.addPackage);
  const removePackage = useDependenciesStore((s) => s.removePackage);

  const [info, setInfo] = useState<NpmSearchResponse | null>(null);
  const [text, setText] = useState<string>('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

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

  return {
    setPage,
    totalPages,
    search,
    info,
    isLoading,
    packages,
    download: {
      loadingPackages,
      addPackage,
      removePackage,
    },
  };
};

export default useDependencies;
