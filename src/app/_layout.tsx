import Loader from "components/misc/Loader";
import useLoading from "components/misc/useLoading";
import "expo-dev-client";
import { SplashScreen, Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { Platform, SafeAreaView, View } from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import { useLanguageUpdater } from "../components/utils/i18n";
import Index from "./Index";

SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  if (Platform.OS == "android") useLanguageUpdater();
  const [isLogged, setIsLogged] = useState(false);
  const { loading } = useLoading();
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
        <Stack screenOptions={{ contentStyle: { backgroundColor: "#020912" } }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="Post"
            options={{
              headerShown: false,
              presentation: "modal",
            }}
          />
        </Stack>
      ) : (
        // </Animated.View>
        <Index setIsLogged={setIsLogged} />
      )}
      <Spinner
        visible={loading}
        overlayColor="#00000099"
        textContent={"Loading"}
        customIndicator={<Loader />}
        textStyle={{ color: "#fff", marginTop: -25 }}
        animation="fade"
      />
    </View>
  );
}
