import ar from "@/assets/locales/ar.json";
import de from "@/assets/locales/de.json";
import en from "@/assets/locales/en.json";
import es from "@/assets/locales/es.json";
import fr from "@/assets/locales/fr.json";
import hi from "@/assets/locales/hi.json";
import it from "@/assets/locales/it.json";
import ja from "@/assets/locales/ja.json";
import ko from "@/assets/locales/ko.json";
import pt from "@/assets/locales/pt.json";
import ru from "@/assets/locales/ru.json";
import zh from "@/assets/locales/zh.json";
import { getLocales } from "expo-localization";
import * as SecureStore from "expo-secure-store";
import i18n from "i18next";
import "intl-pluralrules";
import { useEffect, useRef, useState } from "react";
import { initReactI18next } from "react-i18next";
import { AppState, AppStateStatus } from "react-native";

const resources = {
  ar: {
    translation: ar,
  },
  de: {
    translation: de,
  },
  en: {
    translation: en,
  },
  es: {
    translation: es,
  },
  fr: {
    translation: fr,
  },
  hi: {
    translation: hi,
  },
  it: {
    translation: it,
  },
  ja: {
    translation: ja,
  },
  ko: {
    translation: ko,
  },
  pt: {
    translation: pt,
  },
  ru: {
    translation: ru,
  },
  zh: {
    translation: zh,
  },
};
i18n.use(initReactI18next).init({
  resources,
  lng: getLocales()[0].languageCode ?? "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  react: { useSuspense: false },
  cleanCode: true,
});

i18n.services.formatter?.add("lowercase", (value, lng, options) => {
  return value.toLowerCase();
});

const useLanguageUpdater = () => {
  const appState = useRef(AppState.currentState);
  const [currentLang, setCurrentLang] = useState(getLocales()[0].languageCode);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        const newLang = getLocales()[0].languageCode;
        if (newLang !== currentLang) {
          SecureStore.setItem("language", newLang as string);
          i18n.changeLanguage(newLang ?? undefined);
          setCurrentLang(newLang);
        }
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, [currentLang]);

  return null;
};

export { i18n, useLanguageUpdater };
