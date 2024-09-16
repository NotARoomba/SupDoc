import Icons from "@expo/vector-icons/Octicons";
import { SplashScreen, Tabs } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Platform, View, Animated, KeyboardAvoidingView } from "react-native";
import * as SecureStore from "expo-secure-store";
import { UserType } from "components/utils/Types";
import { ParamListBase } from "@react-navigation/native";
import { callAPI, logout } from "components/utils/Functions";
import { User } from "@/backend/models/user";
import { STATUS_CODES } from "@/backend/models/util";

export default function TabLayout() {
  const [userType, setUserType] = useState<UserType>();

  // const [user, setUser] = useState<User>();
  useEffect(() => {
    const updateData = async () => {
      const ut = (await SecureStore.getItemAsync(
        process.env.EXPO_PUBLIC_KEY_NAME_TYPE,
      )) as UserType;
      // const res = await callAPI(`/${ut == UserType.DOCTOR ? "doctors" : "patients"}/`, "GET")
      // if (res.status == STATUS_CODES.USER_NOT_FOUND) return await logout();
      // else if (res.status == STATUS_CODES.GENERIC_ERROR) return Alert.alert("Error", "There was an error fetching your data!")
      setUserType(ut);
      await SplashScreen.hideAsync();
    };
    updateData();
  }, []);
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
        name="index"
        options={{
          tabBarIcon: ({ color }) => (
            <Icons size={38} name="home" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="pins"
        options={{
          href: userType == UserType.DOCTOR ? "/(tabs)/pins" : null,
          tabBarIcon: ({ color }) => (
            <Icons size={38} name="pin" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="upload"
        options={{
          href: userType != UserType.DOCTOR ? "/(tabs)/upload" : null,
          tabBarIcon: ({ color }) => (
            <Icons size={38} name="plus-circle" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
          tabBarIcon: ({ color }) => (
            <Icons size={38} name="gear" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color }) => (
            <Icons size={38} name="person" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
