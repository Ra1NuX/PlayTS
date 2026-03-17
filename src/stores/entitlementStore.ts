import { create } from 'zustand';
import { useAuthStore } from './authStore';
import { isElectron } from '../utils/environment';

type Plan = 'free' | 'pro' | 'team';

interface EntitlementFeatures {
  cloud_sync: boolean;
  ai_proxy: boolean;
  max_bookmarks: number;
  max_envvars: number;
  export_import: boolean;
}

const FREE_FEATURES: EntitlementFeatures = {
  cloud_sync: false,
  ai_proxy: false,
  max_bookmarks: 10,
  max_envvars: 5,
  export_import: false,
};

interface EntitlementState {
  plan: Plan;
  features: EntitlementFeatures;
  expiresAt: number | null;
  isLoading: boolean;
  error: string | null;
  fetchEntitlements: () => Promise<void>;
  isPro: () => boolean;
  hasFeature: (feature: keyof EntitlementFeatures) => boolean;
  canAddBookmark: (currentCount: number) => boolean;
  canAddEnvVar: (currentCount: number) => boolean;
  reset: () => void;
}

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export const useEntitlementStore = create<EntitlementState>((set, get) => ({
  plan: 'free',
  features: FREE_FEATURES,
  expiresAt: null,
  isLoading: false,
  error: null,

  fetchEntitlements: async () => {
    const userId = useAuthStore.getState().userId;
    if (!userId || !API_URL) {
      set({ plan: 'free', features: FREE_FEATURES, expiresAt: null });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const url = `${API_URL}/entitlements?userId=${userId}`;
      let data: { plan?: Plan; features?: Partial<EntitlementFeatures>; expiresAt?: number | null };

      // In Electron, fetch via IPC to avoid CORS issues with playts:// origin
      if (isElectron() && window.electron?.fetchEntitlements) {
        console.log('📡 Fetching entitlements via IPC (Electron)');
        data = await window.electron.fetchEntitlements(url);
      } else {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch entitlements');
        data = await res.json();
      }
      set({
        plan: data.plan || 'free',
        features: { ...FREE_FEATURES, ...data.features },
        expiresAt: data.expiresAt || null,
        isLoading: false,
      });
    } catch (err) {
      console.error('Error fetching entitlements:', err);
      set({
        plan: 'free',
        features: FREE_FEATURES,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  },

  isPro: () => {
    const { plan } = get();
    return plan === 'pro' || plan === 'team';
  },

  hasFeature: (feature) => {
    const value = get().features[feature];
    return typeof value === 'boolean' ? value : value !== 0;
  },

  canAddBookmark: (currentCount) => {
    const max = get().features.max_bookmarks;
    return max === -1 || currentCount < max;
  },

  canAddEnvVar: (currentCount) => {
    const max = get().features.max_envvars;
    return max === -1 || currentCount < max;
  },

  reset: () => {
    set({ plan: 'free', features: FREE_FEATURES, expiresAt: null, error: null });
  },
}));
