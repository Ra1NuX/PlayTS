import { app } from "electron";
import i18next from "i18next";
import Backend from "i18next-fs-backend/cjs";
import path from "path";

const isDev = !app.isPackaged;

const baseLocalesPath = isDev
  ? path.join(__dirname, "../public/locales")
  : path.join(process.resourcesPath, "locales");

  console.log({baseLocalesPath})

export default i18next.use(Backend).init({
  backend: {
    loadPath: baseLocalesPath + "/{{lng}}/{{ns}}.json",
  },
  fallbackLng: "en",
  supportedLngs: ["en", "es"],
  ns: ["common"],
  defaultNS: "common",
  debug: isDev,
})