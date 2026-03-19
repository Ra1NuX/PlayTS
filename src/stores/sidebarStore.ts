import { create } from 'zustand';

type SidebarPanel = number | 'settings' | null;

interface SidebarStore {
  requestedPanel: SidebarPanel | undefined;
  requestPanel: (panel: SidebarPanel) => void;
  clearRequest: () => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  requestedPanel: undefined,
  requestPanel: (panel) => set({ requestedPanel: panel }),
  clearRequest: () => set({ requestedPanel: undefined }),
}));
