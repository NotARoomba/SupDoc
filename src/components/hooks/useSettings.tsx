import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Alert, useColorScheme } from "react-native";
import { useLoading } from "./useLoading";

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
  let colorScheme = useColorScheme();
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const savedLanguage = await SecureStore.getItemAsync("language");
      const savedTheme = await SecureStore.getItemAsync("theme");

      if (savedLanguage) {
        setLanguageState(savedLanguage);
        i18n.changeLanguage(savedLanguage);
      }

      if (savedTheme === "light" || savedTheme === "dark") {
        setThemeState(savedTheme);
      } else {
        setThemeState(colorScheme as "dark" | "light");
        setTheme(colorScheme as "dark" | "light");
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Alert.alert(t("error"), t("errors.fetchSettings"));
    }
  };

  const setLanguage = async (language: string) => {
    try {
      await SecureStore.setItemAsync("language", language);
      setLanguageState(language);
      await i18n.changeLanguage(language);
    } catch (error) {
      Alert.alert(t("error"), t("errors.saveSettings"));
    }
  };

  const setTheme = async (theme: "light" | "dark") => {
    try {
      await SecureStore.setItemAsync("theme", theme);
      setThemeState(theme);
    } catch (error) {
      Alert.alert(t("error"), t("errors.saveSettings"));
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

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
