import "expo-dev-client";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView, View } from "react-native";
import Index from "./Index";
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isLogged, setIsLogged] = useState(false);

  return (
    <View className="text-ivory h-full">
      <SafeAreaView className="bg-richer_black" />
      {isLogged ? (
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      ) : (
        <Index setIsLogged={setIsLogged} />
      )}
    </View>
  );
}
