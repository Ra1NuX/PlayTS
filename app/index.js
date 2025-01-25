"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// main/index.ts
var import_electron3 = require("electron");
var import_path = __toESM(require("path"));

// node_modules/electron-serve/index.js
var import_promises = __toESM(require("node:fs/promises"), 1);
var import_node_path = __toESM(require("node:path"), 1);
var import_electron = __toESM(require("electron"), 1);
var FILE_NOT_FOUND = -6;
var getPath = async (path_, file) => {
  try {
    const result = await import_promises.default.stat(path_);
    if (result.isFile()) {
      return path_;
    }
    if (result.isDirectory()) {
      return getPath(import_node_path.default.join(path_, `${file}.html`));
    }
  } catch {
  }
};
function electronServe(options) {
  options = {
    isCorsEnabled: true,
    scheme: "app",
    hostname: "-",
    file: "index",
    ...options
  };
  if (!options.directory) {
    throw new Error("The `directory` option is required");
  }
  options.directory = import_node_path.default.resolve(import_electron.default.app.getAppPath(), options.directory);
  const handler = async (request, callback) => {
    const indexPath = import_node_path.default.join(options.directory, `${options.file}.html`);
    const filePath = import_node_path.default.join(options.directory, decodeURIComponent(new URL(request.url).pathname));
    const relativePath = import_node_path.default.relative(options.directory, filePath);
    const isSafe = !relativePath.startsWith("..") && !import_node_path.default.isAbsolute(relativePath);
    if (!isSafe) {
      callback({ error: FILE_NOT_FOUND });
      return;
    }
    const finalPath = await getPath(filePath, options.file);
    const fileExtension = import_node_path.default.extname(filePath);
    if (!finalPath && fileExtension && fileExtension !== ".html" && fileExtension !== ".asar") {
      callback({ error: FILE_NOT_FOUND });
      return;
    }
    callback({
      path: finalPath || indexPath
    });
  };
  import_electron.default.protocol.registerSchemesAsPrivileged([
    {
      scheme: options.scheme,
      privileges: {
        standard: true,
        secure: true,
        allowServiceWorkers: true,
        supportFetchAPI: true,
        corsEnabled: options.isCorsEnabled
      }
    }
  ]);
  import_electron.default.app.on("ready", () => {
    const session = options.partition ? import_electron.default.session.fromPartition(options.partition) : import_electron.default.session.defaultSession;
    session.protocol.registerFileProtocol(options.scheme, handler);
  });
  return async (window_, searchParameters) => {
    const queryString = searchParameters ? "?" + new URLSearchParams(searchParameters).toString() : "";
    await window_.loadURL(`${options.scheme}://${options.hostname}${queryString}`);
  };
}

// main/tools/isDev.ts
var import_electron2 = __toESM(require("electron"));
if (typeof import_electron2.default === "string") {
  throw new TypeError("Not running in an Electron environment!");
}
var { env } = process;
var isEnvSet = "ELECTRON_IS_DEV" in env;
var getFromEnv = Number.parseInt(env.ELECTRON_IS_DEV || "0", 10) === 1;
var isDev = isEnvSet ? getFromEnv : !import_electron2.default.app.isPackaged;
var isDev_default = isDev;

// main/tools/getUrl.ts
var domain = isDev_default ? `http://localhost:5173/` : `app://runts.com/`;
var initialLocale = "es-ES";
var getURL = (pathname) => `${domain}${initialLocale}${pathname}`;

// main/index.ts
if (!isDev_default) {
  electronServe({ directory: (0, import_path.join)(__dirname, "renderer"), hostname: "runts.com" });
}
var win;
function createWindow() {
  win = new import_electron3.BrowserWindow({
    width: 800,
    height: 600,
    titleBarStyle: "hidden",
    webPreferences: {
      preload: import_path.default.join(__dirname, "preload.js")
    }
  });
  win.on("enter-full-screen", () => {
    win.webContents.send("toggle-titlebar", false);
  });
  win.on("leave-full-screen", () => {
    win.webContents.send("toggle-titlebar", true);
  });
  const url = getURL("/");
  win.loadURL(url);
}
import_electron3.app.whenReady().then(() => {
  createWindow();
  import_electron3.app.on("activate", () => {
    if (import_electron3.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
import_electron3.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    import_electron3.app.quit();
  }
});
import_electron3.ipcMain.on("app/minimize", () => {
  win.minimize();
});
import_electron3.ipcMain.on("app/maximize", () => {
  if (!win.isMaximized()) {
    win.maximize();
  } else {
    win.unmaximize();
  }
});
import_electron3.ipcMain.on("app/close", () => {
  import_electron3.app.quit();
});
