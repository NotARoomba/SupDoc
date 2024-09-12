import "expo-dev-client";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView, View } from "react-native";
import Index from "./Index";
import { SplashScreen } from "expo-router";
import * as SecureStore from "expo-secure-store";

SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  const [isLogged, setIsLogged] = useState(false);
  useEffect(() => {
    const updateData = async () => {
      await SecureStore.deleteItemAsync(process.env.EXPO_PUBLIC_KEY_NAME_PRIVATE)
      // await SecureStore.deleteItemAsync(process.env.EXPO_PUBLIC_KEY_NAME_PUBLIC)
      // await SecureStore.deleteItemAsync(process.env.EXPO_PUBLIC_KEY_NAME_TYPE)
      // await SecureStore.deleteItemAsync(process.env.EXPO_PUBLIC_KEY_NAME_PASS)
      const privateKey = await SecureStore.getItemAsync(
        process.env.EXPO_PUBLIC_KEY_NAME_PRIVATE,
      );
      // console.log(privateKey)
      if (privateKey !== null) {
        setIsLogged(true);
      } else {
        setIsLogged(false); 
        await SplashScreen.hideAsync();
      }
    };
    updateData();
  }, []);
  return (
    <View className="text-ivory h-full">
      <SafeAreaView className="bg-richer_black" />
      {isLogged ? (
        <Stack>
          <Stack.Screen
            initialParams={{ isLogged: isLogged }}
            name="(tabs)"
            options={{ headerShown: false }}
          />
        </Stack>
      ) : (
        <Index setIsLogged={setIsLogged} />
      )}
    </View>
  );
}
