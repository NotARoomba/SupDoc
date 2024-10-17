import { UserType } from "@/backend/models/util";
import Icons from "@expo/vector-icons/Octicons";
import { useSettings } from "components/hooks/useSettings";
import { useUser } from "components/hooks/useUser";
import { registerForPushNotificationsAsync } from "components/utils/Functions";
import { SplashScreen, Tabs } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect } from "react";
import { Platform } from "react-native";

export default function TabLayout() {
  const { userType, fetchUser, updateToken } = useUser();
  const { fetchSettings } = useSettings();
  const { colorScheme } = useColorScheme();
  useEffect(() => {
    fetchUser()
      .then(fetchSettings)
      .then(registerForPushNotificationsAsync)
      .then((token) => updateToken(token))
      .catch((e) => console.log(e));
    SplashScreen.hideAsync();
  }, [userType]);
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarLabel: () => null,
        tabBarStyle: {
          display: "flex",
          backgroundColor: colorScheme == "dark" ? "#071932" : "#5B95A5",
          position: "absolute",
          bottom: Platform.OS == "ios" ? 40 : 20,
          borderRadius: 12,
          width: 350,
          left: "50%",
          marginLeft: -175,
          height: 60,
          paddingBottom: 0,
          alignItems: "center",
          shadowColor: colorScheme == "dark" ? "#000000" : "#ffffff",
          elevation: 0,
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          borderTopWidth: 0,
        },
        headerTransparent: true,
        headerShown: false,
        tabBarInactiveTintColor: colorScheme == "dark" ? "gray" : "#023c4d",
        tabBarActiveTintColor: "#fbfff1",
      })}
      sceneContainerStyle={{
        zIndex: -900,
        backgroundColor: colorScheme == "dark" ? "#020912" : "#fbfff1",
      }}
    >
      <Tabs.Screen
        name={"index"}
        options={{
          tabBarIcon: ({ color }) => (
            <Icons size={38} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name={"pins"}
        options={{
          href: userType == UserType.DOCTOR ? "/(tabs)/pins" : null,
          tabBarIcon: ({ color }) => (
            <Icons size={38} name="pin" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name={"upload"}
        options={{
          href: userType != UserType.DOCTOR ? "/(tabs)/upload" : null,
          tabBarIcon: ({ color }) => (
            <Icons size={38} name="plus-circle" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name={"profile"}
        options={{
          tabBarIcon: ({ color }) => (
            <Icons size={38} name="person" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
