import { UserType } from "@/backend/models/util";
import Icons from "@expo/vector-icons/Octicons";
import { usePosts } from "components/hooks/usePosts";
import { useSettings } from "components/hooks/useSettings";
import { useUser } from "components/hooks/useUser";
import { registerForPushNotificationsAsync } from "components/utils/Functions";
import { SplashScreen, Tabs } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";

export default function TabLayout() {
  const { userType, fetchUser, updateToken } = useUser();
  const { fetchPosts } = usePosts();
  const { fetchSettings } = useSettings();
  useEffect(() => {
    fetchUser()
      .then(fetchPosts)
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
          backgroundColor: "#071932",
          position: "absolute",
          bottom: Platform.OS == "ios" ? 40 : 20,
          borderRadius: 12,
          width: 350,
          left: "50%",
          marginLeft: -175,
          height: 60,
          paddingBottom: 0,
          alignItems: "center",
          shadowColor: "#000000",
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
        tabBarInactiveTintColor: "gray",
        tabBarActiveTintColor: "#fbfff1",
      })}
      sceneContainerStyle={{
        zIndex: -900,
        backgroundColor: "#020912",
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
