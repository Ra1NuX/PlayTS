import {
  BrowserWindow,
  MessageBoxOptions,
  app,
  dialog,
  ipcMain,
} from "electron";
import { autoUpdater } from "electron-updater";
import express from "express";
import path from "path";

import { getURL } from "./tools/getUrl";

const server = express();
const port = 19293;

server.use(express.static(path.join(__dirname, "renderer")));

server.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "renderer", "index.html"));
});

server.listen(port, () => {
  console.log(`Servidor HTTP ejecutándose en http://localhost:${port}`);
});

let win: BrowserWindow;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: "hidden",
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

  autoUpdater.checkForUpdatesAndNotify();

  const url = getURL("/");
  win.loadURL(url);
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

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

  // OPCIONAL: Preguntar al usuario si quiere reiniciar y aplicar la actualización
  const dialogOpts: MessageBoxOptions = {
    type: "info",
    buttons: ["Reiniciar", "Después"],
    title: "Actualización lista",
    message: "Hay una actualización lista para instalar.",
    detail: "¿Deseas reiniciar la aplicación ahora para aplicar los cambios?",
  };

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});
