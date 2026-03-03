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
import fs from "fs/promises";
import log from "electron-log/main";
import i18nLoaded from "./i18n.config";
import { codeExecutor } from "./codeExecutor";

log.initialize();
console = log as unknown as Console;

import { getURL } from "./tools/getUrl";
import isDev from "./tools/isDev";

if (!isDev) {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'app',
      privileges: {
        standard: true,
        secure: true,
        allowServiceWorkers: true,
        supportFetchAPI: true,
        corsEnabled: true
      }
    }
  ]);
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
  console.log('Cargando URL:', url);
  win.loadURL(url);
}

app.whenReady().then(async () => {
  if (!isDev) {
    const rendererRoot = path.join(__dirname, "renderer");

    protocol.handle('app', async (request) => {
      try {
        const requestUrl = request.url;

        if (requestUrl.includes('fonts.googleapis.com') || requestUrl.includes('fonts.gstatic.com')) {
          console.log(`🔗 Permitiendo carga externa de fuentes: ${requestUrl}`);
          return new Response('External fonts not allowed in production', {
            status: 403,
            headers: { 'Content-Type': 'text/plain' }
          });
        }

        const url = new URL(requestUrl);
        let pathname = url.pathname;

        // Convertir app://-/ a ruta de archivo
        if (pathname.startsWith('/-/')) {
          pathname = pathname.substring(3); // Remover '/-'
        }

        // Normalizar rutas
        if (pathname === '/' || pathname === '') {
          pathname = '/index.html';
        }

        const filePath = path.join(rendererRoot, pathname);

        console.log(`📡 Protocolo app:// solicitando: ${requestUrl} → ${filePath}`);

        // Verificar que el archivo existe
        try {
          await fs.access(filePath);
        } catch {
          console.error(`❌ Archivo no encontrado: ${filePath}`);
          return new Response('Not Found', {
            status: 404,
            headers: { 'Content-Type': 'text/plain' }
          });
        }

        const fileContent = await fs.readFile(filePath);

        // Determinar MIME type
        const ext = path.extname(filePath).toLowerCase();
        let mimeType = 'application/octet-stream';

        if (ext === '.html') mimeType = 'text/html; charset=utf-8';
        else if (ext === '.js' || ext === '.mjs') mimeType = 'application/javascript; charset=utf-8';
        else if (ext === '.css') mimeType = 'text/css; charset=utf-8';
        else if (ext === '.json') mimeType = 'application/json; charset=utf-8';
        else if (ext === '.png') mimeType = 'image/png';
        else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
        else if (ext === '.svg') mimeType = 'image/svg+xml';

        // Crear un ArrayBuffer estándar para evitar problemas con SharedArrayBuffer
        const arrayBuffer = new ArrayBuffer(fileContent.length);
        const view = new Uint8Array(arrayBuffer);
        view.set(fileContent);

        return new Response(arrayBuffer, {
          status: 200,
          headers: {
            'Content-Type': mimeType,
            // Headers necesarios para SharedArrayBuffer en WebContainers
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Embedder-Policy': 'require-corp'
          }
        });

      } catch (error) {
        console.error('❌ Error en protocolo app://:', error);
        return new Response('Internal Server Error', {
          status: 500,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    });

    console.log('✅ Protocolo app:// registrado correctamente con protocol.handle');
  }

  // Esperar a que el protocolo esté registrado antes de crear la ventana
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
