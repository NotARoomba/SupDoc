import en from "@/assets/locales/en.json";
import es from "@/assets/locales/es.json";
import i18n from "i18next";
import "intl-pluralrules";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: en,
  },
  es: {
    translation: es,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  cleanCode: true,
});

export default i18n;
