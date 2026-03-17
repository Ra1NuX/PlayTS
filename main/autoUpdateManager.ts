/**
 * Auto-updater event handlers and update dialog logic.
 */

import { MessageBoxOptions, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import i18next from 'i18next';

export function registerAutoUpdateHandlers(): void {
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
}
