import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS } from "../src/constants/ipcChannels";

export const api = {
  getVersion: () => ipcRenderer.sendSync(IPC_CHANNELS.APP_VERSION),
  maximize: () => ipcRenderer.send(IPC_CHANNELS.APP_MAXIMIZE),
  minimize: () => ipcRenderer.send(IPC_CHANNELS.APP_MINIMIZE),
  onToggleTitlebar: (callback: (show: boolean) => void) => ipcRenderer.on(IPC_CHANNELS.TOGGLE_TITLEBAR, (_event, show) => callback(show)),
  close: () => ipcRenderer.send(IPC_CHANNELS.APP_CLOSE),

  // API for code execution
  executeCode: (options: { code: string; globalBookmarksCode?: string; dependencies?: Record<string, string> }) =>
    ipcRenderer.invoke(IPC_CHANNELS.CODE_EXECUTE, options),

  // API for package management
  installPackage: (name: string, version: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.PACKAGE_INSTALL, { name, version }),

  uninstallPackage: (name: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.PACKAGE_UNINSTALL, { name }),

  // API for getting environment information
  getEnvironmentInfo: () =>
    ipcRenderer.invoke(IPC_CHANNELS.ENV_INFO),

  // Auth: open sign-in in system browser (deep-link OAuth flow)
  openSignInExternal: (url: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.AUTH_OPEN_SIGN_IN, { url }),
  onOAuthComplete: (callback: (url: string) => void) =>
    ipcRenderer.on(IPC_CHANNELS.AUTH_OAUTH_COMPLETE, (_event, url) => callback(url)),
  removeOAuthCompleteListener: () =>
    ipcRenderer.removeAllListeners(IPC_CHANNELS.AUTH_OAUTH_COMPLETE),
  requestSignInToken: (userId: string, apiUrl: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.AUTH_REQUEST_SIGN_IN_TOKEN, { userId, apiUrl }),
  fetchEntitlements: (url: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.AUTH_FETCH_ENTITLEMENTS, { url }),

  // Auth: Clerk token cache (GameGlass pattern — tokens in main process memory)
  sendClerkToken: (token: string | null) =>
    ipcRenderer.send(IPC_CHANNELS.AUTH_CLERK_TOKEN, token),
  getClerkToken: () =>
    ipcRenderer.invoke(IPC_CHANNELS.AUTH_CLERK_TOKEN_GET) as Promise<string | null>,
  onTokenRefreshed: (callback: () => void) =>
    ipcRenderer.on(IPC_CHANNELS.AUTH_TOKEN_REFRESHED, () => callback()),
  removeTokenRefreshedListener: () =>
    ipcRenderer.removeAllListeners(IPC_CHANNELS.AUTH_TOKEN_REFRESHED),
  clerkLogout: () =>
    ipcRenderer.send(IPC_CHANNELS.AUTH_CLERK_LOGOUT),
};

contextBridge.exposeInMainWorld("electron", api);