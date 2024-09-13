import { STATUS_CODES } from "@/backend/models/util";
import { callAPI, logout } from "components/utils/Functions";
import { UserType } from "components/utils/Types";
import { useEffect, useState } from "react";
import { View, Text, Alert } from "react-native";
import * as SecureStore from 'expo-secure-store'
import { User } from "@/backend/models/user";
import { SplashScreen } from "expo-router";
import Loader from "components/misc/Loader";
import Spinner from "react-native-loading-spinner-overlay";

export default function Profile() {
  const [userType, setUserType] = useState<UserType>();
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const updateUser = async () => {
      setLoading(true)
      const ut = (await SecureStore.getItemAsync(
            process.env.EXPO_PUBLIC_KEY_NAME_TYPE,
          )) as UserType;
      const res = await callAPI(`/${ut == UserType.DOCTOR ? "doctors" : "patients"}/`, "GET")
      if (res.status == STATUS_CODES.USER_NOT_FOUND) return await logout();
      else if (res.status == STATUS_CODES.GENERIC_ERROR) return Alert.alert("Error", "There was an error fetching your data!")
      setUser(res.user)
      console.log(res.user)
      setUserType(ut);
      setLoading(false);
      // await SplashScreen.hideAsync();
    }
  updateUser();
  }, [])
  return (
    <View className="h-full">
      <Text className="text-6xl text-ivory">PROFILE</Text>
      <Spinner
          visible={loading}
          overlayColor="#000000cc"
          textContent={"Loading"}
          customIndicator={<Loader />}
          textStyle={{ color: "#fff", marginTop: -25 }}
          animation="fade"
        />
    </View>
  );
}
