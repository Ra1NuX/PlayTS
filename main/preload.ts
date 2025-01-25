import { contextBridge, ipcRenderer } from "electron";

console.log("iom here");

export const api = {
    
  maximize: () => ipcRenderer.send("app/maximize"),
  minimize: () => ipcRenderer.send("app/minimize"),
  onToggleTitlebar: (callback: (show: boolean) => void) => ipcRenderer.on('toggle-titlebar', (_event, show) => callback(show)),
  close: () => ipcRenderer.send("app/close"),
};

contextBridge.exposeInMainWorld("electron", api);
