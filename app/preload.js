"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main/preload.ts
var preload_exports = {};
__export(preload_exports, {
  api: () => api
});
module.exports = __toCommonJS(preload_exports);
var import_electron = require("electron");
console.log("iom here");
var api = {
  maximize: () => import_electron.ipcRenderer.send("app/maximize"),
  minimize: () => import_electron.ipcRenderer.send("app/minimize"),
  onToggleTitlebar: (callback) => import_electron.ipcRenderer.on("toggle-titlebar", (_event, show) => callback(show)),
  close: () => import_electron.ipcRenderer.send("app/close")
};
import_electron.contextBridge.exposeInMainWorld("electron", api);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  api
});
