import * as SecureStore from "expo-secure-store";
// import { NativeWindStyleSheet } from "nativewind";
import * as Nativewind from "nativewind";

import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Alert, Appearance, StatusBar, useColorScheme } from "react-native";
import { useLoading } from "./useLoading";
import { useUser } from "./useUser";
import SupDocEvents from "@/backend/models/events";

interface SettingsContextType {
  language: string | null;
  theme: "light" | "dark" | null;
  setLanguage: (language: string) => Promise<void>;
  setTheme: (theme: "light" | "dark") => Promise<void>;
  fetchSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children,
}) => {
  const { t, i18n } = useTranslation();
  const { setLoading } = useLoading();
  const [language, setLanguageState] = useState<string | null>(null);
  const [theme, setThemeState] = useState<"light" | "dark" | null>(null);
  const {socket} = useUser();
  //let colorScheme = useColorScheme();
  const { setColorScheme, colorScheme } = Nativewind.useColorScheme();

  const fetchSettings = async () => {
    // setLoading(true);
    try {
      const savedLanguage = await SecureStore.getItemAsync("language");
      const savedTheme = await SecureStore.getItemAsync("theme");

      if (savedLanguage) {
        setLanguageState(savedLanguage);
        i18n.changeLanguage(savedLanguage);
        if (socket) socket.emit(SupDocEvents.UPDATE_LANGUAGE, savedLanguage);
      }

      if (savedTheme === "light" || savedTheme === "dark") {
        setThemeState(savedTheme);
        //setColorScheme(savedTheme);
        Appearance.setColorScheme(savedTheme);
        // NativeWindStyleSheet.setColorScheme(savedTheme);
        StatusBar.setBarStyle(
          savedTheme !== "light" ? "light-content" : "dark-content",
          true,
        );
      } else {
        setThemeState(colorScheme as "dark" | "light");
        setTheme(colorScheme as "dark" | "light");
      }
      //setLoading(false);
    } catch (error) {
      //setLoading(false);
      Alert.alert(t("error"), t("errors.fetchSettings"));
    }
  };

  const setLanguage = async (language: string) => {
    try {
      await SecureStore.setItemAsync("language", language);
      setLanguageState(language);
      await i18n.changeLanguage(language);
      if (socket) socket.emit(SupDocEvents.UPDATE_LANGUAGE, language);
    } catch (error) {
      Alert.alert(t("error"), t("errors.saveSettings"));
    }
  };

  const setTheme = async (newTheme: "light" | "dark") => {
    try {
      await SecureStore.setItemAsync("theme", newTheme);
      console.log(newTheme);
      // NativeWindStyleSheet.setColorScheme(newTheme);
      //setColorScheme(newTheme);
      Appearance.setColorScheme(newTheme);
      StatusBar.setBarStyle(
        newTheme !== "light" ? "light-content" : "dark-content",
        true,
      );
      setThemeState(newTheme);
    } catch (error) {
      Alert.alert(t("error"), t("errors.saveSettings"));
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [socket]);

  return (
    <SettingsContext.Provider
      value={{ language, theme, setLanguage, setTheme, fetchSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
