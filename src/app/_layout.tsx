import { LoadingProvider } from "components/hooks/useLoading";
import { PostsProvider } from "components/hooks/usePosts";
import { SettingsProvider } from "components/hooks/useSettings";
import { UserProvider } from "components/hooks/useUser";
import Loading from "components/loading/Loading";
import "expo-dev-client";
import { SplashScreen, Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { Appearance, Platform, SafeAreaView, StatusBar, useColorScheme, View } from "react-native";
import "react-native-reanimated";
import { useLanguageUpdater } from "../components/utils/i18n";
import Index from "./Index";
import "@/global.css"
// import { logout } from "components/utils/Functions";

SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  Appearance.addChangeListener((e) => {
    console.log(e)
    console.log("Appearance changed");
  })
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
        setIsLogged(false);
      }
    };
    updateData();
  }, []);
  return (
    <View className=" h-full dark:text-ivory  text-richer_black dark:bg-richer_black bg-ivory">
      <StatusBar barStyle="dark-content" />
      <LoadingProvider>
        <UserProvider>
          <PostsProvider>
            <SettingsProvider>
              <SafeAreaView className="dark:text-ivory  text-richer_black dark:bg-richer_black bg-ivory" />

              {isLogged ? (
                // <Animated.View entering={FadeIn.duration(500)}>
                <Stack
                  screenOptions={{
                    headerTransparent: true,
                    headerShown: false,
                    contentStyle: { backgroundColor: "#020912" },
                  }}
                >
                  <Stack.Screen
                    name="(tabs)"
                  />
                  <Stack.Screen
                    name="Post"
                    options={{
                      presentation: "fullScreenModal",
                    }}
                  />
                  <Stack.Screen
                    name="User"
                    options={{
                      presentation: "fullScreenModal",
                    }}
                  />
                  <Stack.Screen
                    name="Settings"
                    options={{
                      presentation: "fullScreenModal",
                    }}
                  />
                </Stack>
              ) : (
                // </Animated.View>
                <Index setIsLogged={setIsLogged} />
              )}
              <Loading />
            </SettingsProvider>
          </PostsProvider>
        </UserProvider>
      </LoadingProvider>
    </View>
  );
}
