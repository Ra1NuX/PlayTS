/**
 * All IPC handler registrations.
 */

import { app, ipcMain, shell } from 'electron';
import { codeExecutor } from './codeExecutor';
import { getWin } from './windowManager';
import { getClerkToken, setClerkToken, saveTokenToDisk } from './clerkAuthManager';
import { IPC_CHANNELS } from '../src/constants/ipcChannels';

export function registerIpcHandlers(): void {
  // ── Window controls ─────────────────────────────────────────────────────
  ipcMain.on(IPC_CHANNELS.APP_MINIMIZE, () => {
    getWin().minimize();
  });

  ipcMain.on(IPC_CHANNELS.APP_MAXIMIZE, () => {
    const win = getWin();
    if (!win.isMaximized()) {
      win.maximize();
    } else {
      win.unmaximize();
    }
  });

  ipcMain.on(IPC_CHANNELS.APP_CLOSE, () => {
    app.quit();
  });

  ipcMain.on(IPC_CHANNELS.APP_VERSION, (event) => {
    event.returnValue = app.getVersion();
  });

  // ── Auth / Clerk ────────────────────────────────────────────────────────
  ipcMain.on(IPC_CHANNELS.AUTH_CLERK_TOKEN, (_event, token: string | null) => {
    setClerkToken(token);
    saveTokenToDisk(token);
  });

  ipcMain.handle(IPC_CHANNELS.AUTH_CLERK_TOKEN_GET, async () => {
    return getClerkToken();
  });

  ipcMain.on(IPC_CHANNELS.AUTH_CLERK_LOGOUT, () => {
    setClerkToken(null);
  });

  ipcMain.handle(IPC_CHANNELS.AUTH_OPEN_SIGN_IN, async (_event, { url }: { url: string }) => {
    console.log('🔗 Opening sign-in in system browser:', url);
    shell.openExternal(url);
  });

  ipcMain.handle(IPC_CHANNELS.AUTH_FETCH_ENTITLEMENTS, async (_event, { url }: { url: string }) => {
    console.log('📡 Fetching entitlements from main process:', url);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch entitlements: ${res.status}`);
    return await res.json();
  });

  ipcMain.handle(IPC_CHANNELS.AUTH_REQUEST_SIGN_IN_TOKEN, async (_event, { userId, apiUrl }: { userId: string; apiUrl: string }) => {
    console.log('🔗 Requesting sign-in token for:', userId);
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error(`Failed to request sign-in token: ${res.status}`);
    const { token } = await res.json();
    return token;
  });

  // ── Code execution ──────────────────────────────────────────────────────
  ipcMain.handle(IPC_CHANNELS.CODE_EXECUTE, async (_event, options) => {
    try {
      console.log("📡 Recibida solicitud de ejecución de código via ICP");
      return await codeExecutor.executeCode(options);
    } catch (error) {
      console.error("❌ Error en handler code/execute:", error);
      throw error;
    }
  });

  // ── Package management ──────────────────────────────────────────────────
  ipcMain.handle(IPC_CHANNELS.PACKAGE_INSTALL, async (_event, { name, version }) => {
    try {
      console.log(`📡 Recibida solicitud de instalación de paquete via ICP: ${name}@${version}`);
      return await codeExecutor.installPackage(name, version);
    } catch (error) {
      console.error("❌ Error en handler package/install:", error);
      throw error;
    }
  });

  ipcMain.handle(IPC_CHANNELS.PACKAGE_UNINSTALL, async (_event, { name }) => {
    try {
      console.log(`📡 Recibida solicitud de desinstalación de paquete via ICP: ${name}`);
      return await codeExecutor.uninstallPackage(name);
    } catch (error) {
      console.error("❌ Error en handler package/uninstall:", error);
      throw error;
    }
  });

  // ── Environment info ────────────────────────────────────────────────────
  ipcMain.handle(IPC_CHANNELS.ENV_INFO, async (_event) => {
    try {
      console.log("📡 Recibida solicitud de información del entorno via ICP");
      return codeExecutor.getEnvironmentInfo();
    } catch (error) {
      console.error("❌ Error en handler env/info:", error);
      throw error;
    }
  });
}
