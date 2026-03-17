/**
 * Window creation and management.
 */

import { BrowserWindow, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import path from 'path';
import { getURL } from './tools/getUrl';
import { setupPeriodicUpdateCheck } from './autoUpdateManager';
import { IPC_CHANNELS } from '../src/constants/ipcChannels';

let win: BrowserWindow;

export function getWin(): BrowserWindow {
  return win;
}

export function createWindow(): void {
  win = new BrowserWindow({
    width: 1140,
    height: 635,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: "hidden",
    icon: path.join(__dirname, "renderer", "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
  });

  win.on("enter-full-screen", () => {
    win.webContents.send(IPC_CHANNELS.TOGGLE_TITLEBAR, false);
  });

  win.on("leave-full-screen", () => {
    win.webContents.send(IPC_CHANNELS.TOGGLE_TITLEBAR, true);
  });

  autoUpdater.allowPrerelease = true;
  console.log("Checking for updates...");
  autoUpdater.checkForUpdates().catch(console.error);
  setupPeriodicUpdateCheck();

  // Open all target="_blank" links in the system browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  const loadUrl = getURL("/");
  console.log('Cargando URL:', loadUrl);
  win.loadURL(loadUrl);
}
