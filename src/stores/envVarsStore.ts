import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { EnvVar, NewEnvVar } from '../model/envVar';

interface EnvVarsStore {
  envVars: EnvVar[];
  addEnvVar: (envVar: NewEnvVar) => void;
  updateEnvVar: (id: string, updates: Partial<EnvVar>) => void;
  deleteEnvVar: (id: string) => void;
  toggleActive: (id: string) => void;
  setEnvVars: (envVars: EnvVar[]) => void;
  getActiveEnvVars: () => EnvVar[];
}

export const useEnvVarsStore = create<EnvVarsStore>()(
  persist(
    (set, get) => ({
      envVars: [],

      addEnvVar: (newEnvVar: NewEnvVar) => {
        const envVar: EnvVar = {
          id: crypto.randomUUID(),
          key: newEnvVar.key,
          value: newEnvVar.value,
          isActive: newEnvVar.isActive,
          createdAt: new Date(),
        };
        set((state) => ({ envVars: [...state.envVars, envVar] }));
      },

      updateEnvVar: (id: string, updates: Partial<EnvVar>) => {
        set((state) => ({
          envVars: state.envVars.map((ev) =>
            ev.id === id ? { ...ev, ...updates } : ev
          ),
        }));
      },

      deleteEnvVar: (id: string) => {
        set((state) => ({
          envVars: state.envVars.filter((ev) => ev.id !== id),
        }));
      },

      toggleActive: (id: string) => {
        set((state) => ({
          envVars: state.envVars.map((ev) =>
            ev.id === id ? { ...ev, isActive: !ev.isActive } : ev
          ),
        }));
      },

      setEnvVars: (envVars: EnvVar[]) => {
        set({ envVars });
      },

      getActiveEnvVars: () => {
        return get().envVars.filter((ev) => ev.isActive);
      },
    }),
    {
      name: 'env-vars-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ envVars: state.envVars }),
      onRehydrateStorage: () => (state) => {
        if (state?.envVars) {
          state.envVars = state.envVars.map((ev) => ({
            ...ev,
            createdAt: new Date(ev.createdAt),
          }));
        }
      },
    }
  )
);

export const useEnvVars = () => useEnvVarsStore((state) => state.envVars);

export const useActiveEnvVars = () =>
  useEnvVarsStore((state) => state.envVars.filter((ev) => ev.isActive));

export const useEnvVarsActions = () => ({
  addEnvVar: useEnvVarsStore.getState().addEnvVar,
  updateEnvVar: useEnvVarsStore.getState().updateEnvVar,
  deleteEnvVar: useEnvVarsStore.getState().deleteEnvVar,
  toggleActive: useEnvVarsStore.getState().toggleActive,
  setEnvVars: useEnvVarsStore.getState().setEnvVars,
});
