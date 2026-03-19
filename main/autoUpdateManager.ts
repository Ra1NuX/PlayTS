/**
 * Auto-updater event handlers and periodic update checking.
 */

import { autoUpdater } from 'electron-updater';
import { getWin } from './windowManager';
import { IPC_CHANNELS } from '../src/constants/ipcChannels';

export function registerAutoUpdateHandlers(): void {
  autoUpdater.on("checking-for-update", () => {
    console.log("Checking for updates...");
  });

  autoUpdater.on("update-available", (info) => {
    console.log("Update available", info);
    const win = getWin();
    if (win && !win.isDestroyed()) {
      win.webContents.send(IPC_CHANNELS.UPDATE_AVAILABLE, { version: info.version });
    }
  });

  autoUpdater.on("update-not-available", (info) => {
    console.log("No updates available", info);
  });

  autoUpdater.on("error", (err) => {
    console.error("Error checking for updates", err);
  });

  autoUpdater.on("download-progress", (progressObj) => {
    console.log(
      `Downloading update... Speed: ${progressObj.bytesPerSecond} - Progress: ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`
    );
  });

  autoUpdater.on("update-downloaded", (info) => {
    console.log("Update downloaded", info);
    const win = getWin();
    if (win && !win.isDestroyed()) {
      win.webContents.send(IPC_CHANNELS.UPDATE_DOWNLOADED, { version: info.version });
    }
  });
}

export function setupPeriodicUpdateCheck(): void {
  setInterval(() => {
    autoUpdater.checkForUpdates().catch(console.error);
  }, 30 * 60 * 1000);
}
