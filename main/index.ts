import { BrowserWindow, app } from "electron";
import log from "electron-log/main";
import i18nLoaded from "./i18n.config";
import { createWindow } from "./windowManager";
import { registerIpcHandlers } from "./ipcHandlers";
import { registerClerkInterceptors } from "./clerkAuthManager";
import { registerProtocolClient, registerProtocolHandler, handleDeepLink } from "./protocolHandler";
import { registerAutoUpdateHandlers } from "./autoUpdateManager";

log.initialize();
console = log as unknown as Console;

// Register playts:// protocol client (must happen before app.whenReady)
registerProtocolClient();

// Single instance lock — required on Windows/Linux to receive deep links
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

// Windows/Linux: deep link arrives via second-instance event
app.on('second-instance', (_event, commandLine) => {
  const url = commandLine.find((arg) => arg.startsWith('playts://'));
  if (url) handleDeepLink(url);
});

// macOS: deep link arrives via open-url event
app.on('open-url', (event, url) => {
  event.preventDefault();
  handleDeepLink(url);
});

app.whenReady().then(async () => {
  await registerProtocolHandler();
  registerClerkInterceptors();

  // Wait for the protocol to be registered before creating the window
  await i18nLoaded;
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.commandLine.appendSwitch("enable-features", "SharedArrayBuffer");

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Register all IPC handlers and auto-update event handlers
registerIpcHandlers();
registerAutoUpdateHandlers();
