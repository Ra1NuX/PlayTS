import { BrowserWindow, app, ipcMain } from "electron";
import path, { join } from "path";
// import { fileURLToPath } from "url";
import serve from "electron-serve";
import isDev from "./tools/isDev";
import { getURL } from "./tools/getUrl";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

if (!isDev) {
  serve({ directory: join(__dirname, "renderer"), hostname: "runts.com" });
}

let win: BrowserWindow;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    titleBarStyle: "hidden",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.on('enter-full-screen', () => {
    win.webContents.send('toggle-titlebar', false);
  })

  win.on('leave-full-screen', () => {
    win.webContents.send('toggle-titlebar', true);
  })

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
