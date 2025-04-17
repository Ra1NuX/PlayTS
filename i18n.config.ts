import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import I18nextBrowserLanguageDetector from "i18next-browser-languagedetector";
import backend from 'i18next-http-backend';


i18n
  .use(backend)
  .use(I18nextBrowserLanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: ["en", "es"],
    load: "languageOnly",
    ns: ["common", "desktop"],
    defaultNS: "common",
    backend: {
      loadPath: typeof window !== "undefined" ? "/locales/{{lng}}/{{ns}}.json" : "./renderer/locales/{{lng}}/{{ns}}.json",
      addPath: typeof window !== "undefined" ? "/locales/{{lng}}/{{ns}}.missing.json" : "./renderer/locales/{{lng}}/{{ns}}.missing.json",
      
    },
    debug: true,
    saveMissing: true,
    saveMissingTo: "current",
    detection: {
        order: [
            'localStorage',
            'sessionStorage',
            'cookie',
            'navigator',
          ],
          caches: ['localStorage', 'sessionStorage', 'cookie'],
    },
    interpolation: {
      escapeValue: false,
    },
    // debug: process.env.NODE_ENV === "development",
  });

export default i18n;
