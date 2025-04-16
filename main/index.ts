import {
  BrowserWindow,
  MessageBoxOptions,
  app,
  dialog,
  ipcMain,
} from "electron";
import { autoUpdater } from "electron-updater";
import express from "express";
import i18next from "i18next";
import path from "path";
import log from "electron-log/main";
import i18nLoaded from "./i18n.config";

log.initialize();
console = log as unknown as Console;

import { getURL } from "./tools/getUrl";
import isDev from "./tools/isDev";

if (!isDev) {
  const server = express();
  const port = 19293;
  server.use(express.static(path.join(__dirname, "renderer")));
  server.get("/", (_req, res) => {
    res.sendFile(path.join(__dirname, "renderer", "index.html"));
  });
  server.listen(port, () => {
    console.log(`Servidor HTTP ejecutándose en http://localhost:${port}`);
  });
}

let win: BrowserWindow;

function createWindow() {
  win = new BrowserWindow({
    width: 1140,
    height: 635,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: "hidden",
    icon: path.join(__dirname, "renderer", "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: true,
      webSecurity: false,
      allowRunningInsecureContent: true,
    },
  });

  win.on("enter-full-screen", () => {
    win.webContents.send("toggle-titlebar", false);
  });

  win.on("leave-full-screen", () => {
    win.webContents.send("toggle-titlebar", true);
  });

  autoUpdater.allowPrerelease = true;
  console.log("Checking for updates...");
  autoUpdater.checkForUpdatesAndNotify().catch(console.error);

  const url = getURL("/");
  win.loadURL(url);
}

app.whenReady().then(() => {
  i18nLoaded.then(() => {
    createWindow();
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });
});

app.commandLine.appendSwitch("enable-features", "SharedArrayBuffer");

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.on("app/minimize", () => {
  win.minimize();
});

ipcMain.on("app/maximize", () => {
  if (!win.isMaximized()) {
    win.maximize();
  } else {
    win.unmaximize();
  }
});

ipcMain.on("app/close", () => {
  app.quit();
});

ipcMain.on("app/version", (event) => {
  event.returnValue = app.getVersion();
});

autoUpdater.on("checking-for-update", () => {
  console.log("Buscando actualizaciones...");
});

autoUpdater.on("update-available", (info) => {
  console.log("Actualización disponible", info);
});

autoUpdater.on("update-not-available", (info) => {
  console.log("No hay nuevas actualizaciones", info);
});

autoUpdater.on("error", (err) => {
  console.error("Error al actualizar la aplicación", err);
});

autoUpdater.on("download-progress", (progressObj) => {
  let log_message = "Descargando actualización...";
  log_message = log_message + ` Velocidad: ${progressObj.bytesPerSecond}`;
  log_message = log_message + ` - Progreso: ${progressObj.percent}%`;
  log_message =
    log_message + ` (${progressObj.transferred}/${progressObj.total})`;
  console.log(log_message);
});

autoUpdater.on("update-downloaded", (info) => {
  console.log("Actualización descargada", info);

  const dialogOpts: MessageBoxOptions = {
    type: "question",
    buttons: [i18next.t("RESTART_NOW"), i18next.t("RESTART_AFTER")],
    title: i18next.t("UPDATE_AVAILABLE"),
    message: i18next.t("RESTART_MESSAGE"),
  };

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) {
      autoUpdater.quitAndInstall(true, true);
    }
  });
});
