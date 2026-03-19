import { create } from 'zustand';

interface UpdateState {
  updateVersion: string | null;
  dismissed: boolean;
  setUpdateDownloaded: (version: string) => void;
  dismiss: () => void;
  installUpdate: () => void;
}

export const useUpdateStore = create<UpdateState>((set) => ({
  updateVersion: null,
  dismissed: false,
  setUpdateDownloaded: (version) => set({ updateVersion: version, dismissed: false }),
  dismiss: () => set({ dismissed: true }),
  installUpdate: () => {
    window.electron?.installUpdate();
  },
}));
