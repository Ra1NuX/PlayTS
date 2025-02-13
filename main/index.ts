import { BrowserWindow, app, ipcMain } from "electron";
import path from "path";
// import serve from "electron-serve";
// import isDev from "./tools/isDev";
import { getURL } from "./tools/getUrl";

import express from 'express'

const server = express();
const port = 19293;

server.use(express.static(path.join(__dirname, 'renderer')));

server.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'renderer', 'index.html'));
});

server.listen(port, () => {
  console.log(`Servidor HTTP ejecutándose en https://localhost:${port}`);
})


let win: BrowserWindow;

function createWindow() {
  
  win = new BrowserWindow({
    width: 800,
    height: 600,
    // minWidth: 800,
    // minHeight: 600,
    titleBarStyle: "hidden",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: true,
      webSecurity: false,
      allowRunningInsecureContent: true,
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

app.commandLine.appendSwitch('enable-features','SharedArrayBuffer')

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
