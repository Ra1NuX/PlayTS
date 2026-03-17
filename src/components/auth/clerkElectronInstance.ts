import { Clerk } from '@clerk/clerk-js';

// In-memory cache for instant access (avoids IPC round-trip race condition).
// IPC is used only for persistence across page reloads.
let _memoryToken: string | null = null;

const IPCTokenCache = {
  async getToken(): Promise<string | null> {
    if (_memoryToken) return _memoryToken;
    const ipcToken = await (window.electron?.getClerkToken?.() ?? null);
    if (ipcToken) _memoryToken = ipcToken;
    return _memoryToken;
  },
  async saveToken(token: string): Promise<void> {
    _memoryToken = token;
    window.electron?.sendClerkToken?.(token);
  },
  clearToken(): void {
    _memoryToken = null;
    window.electron?.clerkLogout?.();
  },
};

let __internal_clerk: Clerk | undefined;

export function getElectronClerkInstance(publishableKey: string): Clerk {
  if (__internal_clerk) return __internal_clerk;

  __internal_clerk = new Clerk(publishableKey);

  console.log('✅ Clerk Electron instance created');
  console.log('✅ __internal_onBeforeRequest exists:', typeof __internal_clerk.__internal_onBeforeRequest);
  console.log('✅ __internal_onAfterResponse exists:', typeof __internal_clerk.__internal_onAfterResponse);

  __internal_clerk.__internal_onBeforeRequest(async (requestInit: any) => {
    requestInit.credentials = 'omit';
    requestInit.url?.searchParams.append('_is_native', '1');
    const jwt = await IPCTokenCache.getToken();
    console.log('✅ Clerk onBeforeRequest | JWT:', jwt ? 'YES' : 'EMPTY');
    (requestInit.headers as Headers).set('authorization', jwt || '');
  });

  __internal_clerk.__internal_onAfterResponse(async (_: any, response: any) => {
    const authHeader = response?.headers?.get('authorization');
    console.log('✅ Clerk onAfterResponse | Auth header:', authHeader ? 'YES' : 'NONE');
    if (authHeader) {
      await IPCTokenCache.saveToken(authHeader);
    }
  });

  return __internal_clerk;
}

export function clearElectronClerkToken(): void {
  IPCTokenCache.clearToken();
}
