import { create } from 'zustand';
import { InstalledPackages } from '../model/npm';
import { installPackage, uninstallPackage } from '../utils/codeExecution';
import { STORAGE_KEYS } from '../constants/localStorage';

interface DependenciesState {
  packages: InstalledPackages;
  loadingPackages: Set<string>;
  setPackages: (packages: InstalledPackages) => void;
  addPackage: (name: string, version: string) => Promise<void>;
  removePackage: (name: string) => Promise<void>;
}

const loadFromStorage = (): InstalledPackages => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.DEPENDENCIES) || '{}');
  } catch {
    console.error('Error loading dependencies from storage');
    return {};
  }
};

export const useDependenciesStore = create<DependenciesState>()((set, get) => ({
  packages: loadFromStorage(),
  loadingPackages: new Set<string>(),

  setPackages: (packages: InstalledPackages) => {
    set({ packages });
    localStorage.setItem(STORAGE_KEYS.DEPENDENCIES, JSON.stringify(packages));
  },

  addPackage: async (name: string, version: string) => {
    set((state) => ({
      loadingPackages: new Set(state.loadingPackages).add(name),
    }));

    const previousPackages = get().packages;
    const dependencies = { ...previousPackages, [name]: version };
    get().setPackages(dependencies);

    const result = await installPackage(name, version);
    if (!result.success) {
      const revertedDeps = { ...dependencies };
      delete revertedDeps[name];
      get().setPackages(revertedDeps);
      console.error(`Error installing ${name}:`, result.error);
    }

    set((state) => {
      const next = new Set(state.loadingPackages);
      next.delete(name);
      return { loadingPackages: next };
    });
  },

  removePackage: async (name: string) => {
    set((state) => ({
      loadingPackages: new Set(state.loadingPackages).add(name),
    }));

    const previousPackages = get().packages;
    const dependencies = { ...previousPackages };
    delete dependencies[name];
    get().setPackages(dependencies);

    const result = await uninstallPackage(name);
    if (!result.success) {
      const revertedDeps = { ...dependencies, [name]: previousPackages[name] };
      get().setPackages(revertedDeps);
      console.error(`Error uninstalling ${name}:`, result.error);
    }

    set((state) => {
      const next = new Set(state.loadingPackages);
      next.delete(name);
      return { loadingPackages: next };
    });
  },
}));
