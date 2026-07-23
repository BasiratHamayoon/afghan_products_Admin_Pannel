import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import ps from "./locales/ps.json";
import fa from "./locales/fa.json";

const RTL_LANGUAGES = ["ps", "fa"];

export const isRTL = (lang) => RTL_LANGUAGES.includes(lang);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ps: { translation: ps },
      fa: { translation: fa },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "ps", "fa"],
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18n_lang",
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;