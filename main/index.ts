import {
  BrowserWindow,
  MessageBoxOptions,
  app,
  dialog,
  ipcMain,
  protocol,
} from "electron";
import { autoUpdater } from "electron-updater";
import i18next from "i18next";
import path from "path";
import log from "electron-log/main";
import i18nLoaded from "./i18n.config";
import { codeExecutor } from "./codeExecutor";

log.initialize();
console = log as unknown as Console;

import { getURL } from "./tools/getUrl";
import isDev from "./tools/isDev";

// En producción, no necesitamos servidor Express
// El protocolo app:// maneja el acceso a archivos estáticos

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
  // Configurar protocolo personalizado para producción
  if (!isDev) {
    protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { standard: true } }]);
    protocol.handle('app', (request: Request) => {
      const url = request.url.substr(6); // Remover 'app://'
      const filePath = path.join(__dirname, 'renderer', url);
      return { path: filePath } as unknown as any;
    });
  }
  
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

// ===== HANDLERS ICP PARA EJECUCIÓN DE CÓDIGO =====

ipcMain.handle("code/execute", async (_event, options) => {
  try {
    console.log("📡 Recibida solicitud de ejecución de código via ICP");
    return await codeExecutor.executeCode(options);
  } catch (error) {
    console.error("❌ Error en handler code/execute:", error);
    throw error;
  }
});

ipcMain.handle("package/install", async (_event, { name, version }) => {
  try {
    console.log(`📡 Recibida solicitud de instalación de paquete via ICP: ${name}@${version}`);
    return await codeExecutor.installPackage(name, version);
  } catch (error) {
    console.error("❌ Error en handler package/install:", error);
    throw error;
  }
});

ipcMain.handle("package/uninstall", async (_event, { name }) => {
  try {
    console.log(`📡 Recibida solicitud de desinstalación de paquete via ICP: ${name}`);
    return await codeExecutor.uninstallPackage(name);
  } catch (error) {
    console.error("❌ Error en handler package/uninstall:", error);
    throw error;
  }
});

ipcMain.handle("env/info", async (_event) => {
  try {
    console.log("📡 Recibida solicitud de información del entorno via ICP");
    return codeExecutor.getEnvironmentInfo();
  } catch (error) {
    console.error("❌ Error en handler env/info:", error);
    throw error;
  }
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
