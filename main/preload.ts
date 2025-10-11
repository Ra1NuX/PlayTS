import { contextBridge, ipcRenderer } from "electron";

export const api = {
  getVersion: () => ipcRenderer.sendSync("app/version"),
  maximize: () => ipcRenderer.send("app/maximize"),
  minimize: () => ipcRenderer.send("app/minimize"),
  onToggleTitlebar: (callback: (show: boolean) => void) => ipcRenderer.on('toggle-titlebar', (_event, show) => callback(show)),
  close: () => ipcRenderer.send("app/close"),
  
  // API para ejecución de código
  executeCode: (options: { code: string; globalBookmarksCode?: string; dependencies?: Record<string, string> }) => 
    ipcRenderer.invoke("code/execute", options),
  
  // API para gestión de paquetes
  installPackage: (name: string, version: string) => 
    ipcRenderer.invoke("package/install", { name, version }),
  
  uninstallPackage: (name: string) => 
    ipcRenderer.invoke("package/uninstall", { name }),
  
  // API para obtener información del entorno
  getEnvironmentInfo: () => 
    ipcRenderer.invoke("env/info"),
};

contextBridge.exposeInMainWorld("electron", api);