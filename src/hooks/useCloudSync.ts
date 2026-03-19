import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useEntitlementStore } from '../stores/entitlementStore';
import { useBookmarksStore } from '../stores/bookmarksStore';

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const DEBOUNCE_MS = 3000;

type SyncDataType = 'bookmarks' | 'envvars';

// Track local versions per data type
const localVersions: Record<SyncDataType, number> = {
  bookmarks: 0,
  envvars: 0,
};

function canSync(): boolean {
  const { isAuthenticated, userId } = useAuthStore.getState();
  const { hasFeature } = useEntitlementStore.getState();
  return !!(isAuthenticated && userId && API_URL && hasFeature('cloud_sync'));
}

function getUserId(): string | null {
  return useAuthStore.getState().userId;
}

async function pushData(dataType: SyncDataType, data: string): Promise<void> {
  const userId = getUserId();
  if (!userId) return;

  const version = ++localVersions[dataType];

  try {
    const res = await fetch(`${API_URL}/sync/push?userId=${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataType, data, version }),
    });

    if (!res.ok) {
      console.warn(`[Sync] Push ${dataType} failed:`, res.status);
      return;
    }

    const result = await res.json();

    if (result.conflict) {
      console.log(`[Sync] Conflict on ${dataType}, server version: ${result.version}`);
      // Server has newer data — apply it locally
      localVersions[dataType] = result.version;
      applyServerData(dataType, result.serverData);
    } else {
      console.log(`[Sync] Pushed ${dataType} v${version}`);
    }
  } catch (err) {
    console.warn(`[Sync] Push ${dataType} error:`, err);
  }
}

async function pullData(dataType: SyncDataType): Promise<void> {
  const userId = getUserId();
  if (!userId) return;

  try {
    const res = await fetch(`${API_URL}/sync/pull?userId=${userId}&type=${dataType}`);
    if (!res.ok) return;

    const result = await res.json();

    if (!result.data || result.version === 0) return;

    // Only apply if server is newer
    if (result.version > localVersions[dataType]) {
      localVersions[dataType] = result.version;
      applyServerData(dataType, result.data);
      console.log(`[Sync] Pulled ${dataType} v${result.version}`);
    }
  } catch (err) {
    console.warn(`[Sync] Pull ${dataType} error:`, err);
  }
}

async function pullAll(): Promise<void> {
  const userId = getUserId();
  if (!userId || !API_URL) return;

  try {
    const res = await fetch(`${API_URL}/sync/pull?userId=${userId}`);
    if (!res.ok) return;

    const allData = await res.json();

    for (const [type, entry] of Object.entries(allData) as [string, any][]) {
      const dataType = type as SyncDataType;
      if (entry.version > localVersions[dataType]) {
        localVersions[dataType] = entry.version;
        applyServerData(dataType, entry.data);
        console.log(`[Sync] Pulled ${dataType} v${entry.version}`);
      }
    }
  } catch (err) {
    console.warn('[Sync] Pull all error:', err);
  }
}

function applyServerData(dataType: SyncDataType, data: string): void {
  try {
    const parsed = JSON.parse(data);

    if (dataType === 'bookmarks') {
      const bookmarks = parsed.map((b: any) => ({
        ...b,
        createdAt: new Date(b.createdAt),
      }));
      useBookmarksStore.getState().setBookmarks(bookmarks);
    }
  } catch (err) {
    console.warn(`[Sync] Failed to apply ${dataType} data:`, err);
  }
}

function serializeStore(dataType: SyncDataType): string {
  if (dataType === 'bookmarks') {
    return JSON.stringify(useBookmarksStore.getState().bookmarks);
  }
  return '[]';
}

/**
 * Hook that handles cloud sync for bookmarks and envvars.
 * - Pulls from server on mount (if Pro user)
 * - Pushes changes debounced after local edits
 */
export function useCloudSync() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userId = useAuthStore((s) => s.userId);
  const plan = useEntitlementStore((s) => s.plan);
  const bookmarks = useBookmarksStore((s) => s.bookmarks);

  const bookmarksTimer = useRef<ReturnType<typeof setTimeout>>();
  const hasPulled = useRef(false);
  const isPushing = useRef(false);

  const syncEnabled = isAuthenticated && !!userId && (plan === 'pro' || plan === 'team') && !!API_URL;

  // Pull on first auth
  useEffect(() => {
    if (!syncEnabled || hasPulled.current) return;
    hasPulled.current = true;
    // Only pull bookmarks — env vars are never synced (may contain secrets)
    pullData('bookmarks');
  }, [syncEnabled]);

  // Push bookmarks on change (debounced)
  const debouncedPushBookmarks = useCallback(() => {
    if (!syncEnabled || isPushing.current) return;
    clearTimeout(bookmarksTimer.current);
    bookmarksTimer.current = setTimeout(() => {
      isPushing.current = true;
      pushData('bookmarks', serializeStore('bookmarks')).finally(() => {
        isPushing.current = false;
      });
    }, DEBOUNCE_MS);
  }, [syncEnabled]);

  useEffect(() => {
    if (!syncEnabled || !hasPulled.current) return;
    debouncedPushBookmarks();
    return () => clearTimeout(bookmarksTimer.current);
  }, [bookmarks, debouncedPushBookmarks, syncEnabled]);
}
