import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import I18nextBrowserLanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(I18nextBrowserLanguageDetector)
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: ["en", "es"],
    load: "languageOnly",
    ns: ["common", "desktop"],
    defaultNS: "common",
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },

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
    debug: process.env.NODE_ENV === "development",
  });

export default i18n;
