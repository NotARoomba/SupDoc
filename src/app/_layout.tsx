import { NavigationContainer } from "@react-navigation/native";
import { Stack } from "expo-router";
import { useState } from "react";
import { SafeAreaView, View } from "react-native";
import Index from "./Index";

export default function RootLayout() {
  const [isLogged, setIsLogged] = useState(false);
  return (
    <View className="text-ivory">
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
