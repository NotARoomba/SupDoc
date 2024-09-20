import "expo-dev-client";
import { SplashScreen, Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { Platform, SafeAreaView, View } from "react-native";
import { useLanguageUpdater } from "../components/utils/i18n";
import Index from "./Index";

SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  if (Platform.OS == "android") useLanguageUpdater();
  const [isLogged, setIsLogged] = useState(false);
  useEffect(() => {
    const updateData = async () => {
      // await logout();
      const privateKey = await SecureStore.getItemAsync(
        process.env.EXPO_PUBLIC_KEY_NAME_PRIVATE,
      );
      // console.log(privateKey)
      if (privateKey !== null) {
        setIsLogged(true);
      } else {
        await SplashScreen.hideAsync();
        setIsLogged(false);
      }
    };
    updateData();
  }, []);
  return (
    <View className="text-ivory h-full bg-white">
      <SafeAreaView className="bg-richer_black" />
      {isLogged ? (
        // <Animated.View entering={FadeIn.duration(500)}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      ) : (
        // </Animated.View>
        <Index setIsLogged={setIsLogged} />
      )}
    </View>
  );
}
