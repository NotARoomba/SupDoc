import Icons from "@expo/vector-icons/Octicons";
import { PostsProvider } from "components/hooks/usePosts";
import { useUser } from "components/hooks/useUser";
import { UserType } from "components/utils/Types";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

export default function TabLayout() {
  const { userType } = useUser();
  return (
    <PostsProvider>
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
          name={"settings"}
          options={{
            href: null,
            tabBarIcon: ({ color }) => (
              <Icons size={38} name="gear" color={color} />
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
    </PostsProvider>
  );
}
