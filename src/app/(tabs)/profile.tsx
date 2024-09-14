import { STATUS_CODES } from "@/backend/models/util";
import { callAPI, isPatientInfo, logout } from "components/utils/Functions";
import { BirthSex, UserType } from "components/utils/Types";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { User } from "@/backend/models/user";
import { SplashScreen } from "expo-router";
import Loader from "components/misc/Loader";
import Icons from "@expo/vector-icons/Octicons";
import Spinner from "react-native-loading-spinner-overlay";
import { CountryPicker } from "react-native-country-codes-picker";
import parsePhoneNumber from "libphonenumber-js";
import Patient from "@/backend/models/patient";
import Metrics from "@/backend/models/metrics";
import Slider from "components/buttons/Slider";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

export default function Profile() {
  const [userType, setUserType] = useState<UserType>(UserType.PATIENT);
  const [countryShow, setCountryShow] = useState(false);
  const [countryCode, setCountryCode] = useState("🇨🇴+57");
  const [user, setUser] = useState<User>();
  const [userEdit, setUserEdit] = useState<User>();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const ut = (await SecureStore.getItemAsync(
        process.env.EXPO_PUBLIC_KEY_NAME_TYPE,
      )) as UserType;
      const res = await callAPI(
        `/${ut == UserType.DOCTOR ? "doctors" : "patients"}/`,
        "GET",
      );
      if (res.status == STATUS_CODES.USER_NOT_FOUND) return await logout();
      else if (res.status == STATUS_CODES.GENERIC_ERROR)
        return Alert.alert("Error", "There was an error fetching your data!");
      setUser(res.user);
      setUserEdit({
        ...res.user,
        number: parsePhoneNumber(res.user.number)?.nationalNumber,
      });
      setUserType(ut);
      setLoading(false);
    };
    fetchData();
  }, []);
  const updateUser = async () => {
    const res = await callAPI( `/${userType == UserType.DOCTOR ? "doctors" : "patients"}/update`, "POST", userEdit);
    if (res != STATUS_CODES.SUCCESS) {
      // setUserEdit(user);
      return Alert.alert("Error", "There was an error updating your information!")
    }
  }
  return (
    <TouchableWithoutFeedback className="h-full" onPress={Keyboard.dismiss}>
      <View>
        <View className="absolute w-full p-4 flex justify-between flex-row">
          <TouchableOpacity>
            <Icons name="info" size={38} color={"#fbfff1"} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              Alert.alert("Logout", "Are you sure you want to logout?", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Logout",
                  style: "destructive",
                  onPress: () => logout(),
                },
              ])
            }
          >
            <Icons name="sign-out" size={38} color={"#fbfff1"} />
          </TouchableOpacity>
        </View>
        <View className="flex mx-auto mt-20">
          <View className="mx-auto bg-midnight_green p-4 aspect-square rounded-full">
            <View className=" m-auto">
              <Icons name="person" size={150} color={"#fbfff1"} />
            </View>
          </View>
          <Text className="text-2xl mt-2 text-ivory font-semibold text-center">
            {user?.identification.number}
          </Text>
          <View className="h-0.5 rounded-full w-72 mx-auto bg-powder_blue/50 my-4" />
          <Text className="text-center text-lg text-ivory  font-semibold">
            Phone Number
          </Text>
          <View className="flex flex-row justify-center align-middle -mt-3  ">
            <TouchableOpacity
              onPress={() => setCountryShow(!countryShow)}
              className=" bg-rich_black border border-powder_blue/20 border-r-0 text-center align-middle p-1 h-12 mt-3 w-3/12 rounded-l-xl"
            >
              <Text className="align-middle m-auto text-lg text-ivory font-semibold">
                {countryCode}
              </Text>
            </TouchableOpacity>
            <TextInput
              onChangeText={(n) => {
                setUserEdit({ ...userEdit, number: n } as User);
              }}
              value={userEdit?.number}
              keyboardType="phone-pad"
              placeholderTextColor={"#ffffff"}
              className="flex justify-center align-middle  my-auto ml-0 h-12 p-1 py-2.5 pl-3 text-xl mt-3 w-7/12   rounded-xl rounded-l-none bg-rich_black text-ivory border border-powder_blue/20 font-semibold"
            />
          </View>
          {userEdit && isPatientInfo(userType, userEdit) ? (
            <View className="flex w-full flex-row px-8">
              <View>
              <View className="flex w-full flex-row h-fit ">
                <View className="w-1/2 flex flex-col">
                  <Text className="text-center text-lg text-ivory  mt-4 font-semibold">
                    Height (cm)
                  </Text>

                  <TextInput
                    onChangeText={(h) =>
                      setUserEdit({
                        ...(userEdit as Patient<null>),
                        info: {
                          ...(userEdit as Patient<null>).info,
                          height: isNaN(parseInt(h)) ? 0 : parseInt(h),
                        },
                      })
                    }
                    value={
                      userEdit.info.height == 0
                        ? ""
                        : userEdit.info.height.toString()
                    }
                    maxLength={3}
                    keyboardType="phone-pad"
                    placeholderTextColor={"#ffffff"}
                    className="flex justify-center align-middle text-center  m-auto h-12 py-2.5 text-xl mt-2 w-6/12   rounded-xl bg-rich_black text-ivory border border-powder_blue/20 font-semibold"
                  />
                </View>
                <View className="w-1/2 flex flex-col">
                  <Text className="text-center text-lg text-ivory  mt-4 font-semibold">
                    Weight (kg)
                  </Text>

                  <TextInput
                    onChangeText={(w) =>
                      setUserEdit({
                        ...userEdit,
                        info: {
                          ...userEdit.info,
                          weight: isNaN(parseInt(w)) ? 0 : parseInt(w),
                        },
                      })
                    }
                    value={
                      userEdit.info.weight == 0
                        ? ""
                        : userEdit.info.weight.toString()
                    }
                    maxLength={3}
                    keyboardType="phone-pad"
                    placeholderTextColor={"#ffffff"}
                    className="flex justify-center align-middle text-center  m-auto h-12 py-2.5 text-xl mt-2 w-6/12   rounded-xl bg-rich_black text-ivory border border-powder_blue/20 font-semibold"
                  />
                </View>
                </View>
                 {(userEdit.info.sex == BirthSex.FEMALE ||
                (userEdit.info.surgery &&
                  userEdit.info.altSex == BirthSex.FEMALE)) && (
                <View className="flex flex-col">
                  <Text className="text-center text-lg text-ivory  mt-4 font-semibold">
                    Pregnant
                  </Text>
              <Slider
                    options={["Yes", "No"]}
                    setOption={(v) =>
                      setUserEdit({
                        ...userEdit,
                        info: { ...userEdit.info, pregnant: v == "Yes" },
                      })
                    }
                    selected={userEdit.info.pregnant ? "Yes" : "No"}
                  />
                </View>
              )}
              </View>
             
             
            </View>
          ) : (
            <View />
          )}
           {JSON.stringify({...userEdit, number: countryCode.slice(4) + userEdit?.number} as User) != JSON.stringify(user) && <View
            className={
              "flex flex-col absolute gap-y-4 w-full z-10 bottom-4"
            }
          ><Animated.View
                entering={FadeIn.duration(500)}
                exiting={FadeOut.duration(500)}
                className="mt-5"
              >
                <TouchableOpacity
                  onPress={() => {}}
                  className={
                    "  bg-oxforder_blue mx-auto px-32 py-2.5 transition-all duration-300 rounded-lg "
                  }
                >
                  <Text className="text-xl  text-ivory font-medium text-center">
                    Update
                  </Text>
                </TouchableOpacity>
              </Animated.View></View>}
        </View>
        <CountryPicker
          show={countryShow}
          // when picker button press you will get the country object with dial code
          pickerButtonOnPress={(item: { flag: any; dial_code: any }) => {
            setCountryCode(item.flag + item.dial_code);
            setCountryShow(!countryShow);
          }}
          // androidWindowSoftInputMode={"pan"}
          onBackdropPress={() => setCountryShow(!countryShow)}
          lang={"en"}
          style={{
            modal: { height: "50%", backgroundColor: "#041225" },
            countryButtonStyles: {
              backgroundColor: "#041225",
              borderColor: "rgba(180, 197, 228, 0.1)",
              borderWidth: 1,
            },
            searchMessageText: { color: "#fbfff1" },
            textInput: {
              backgroundColor: "#041225",
              borderColor: "rgba(180, 197, 228, 0.3)",
              borderWidth: 1,
              paddingLeft: 10,
            },
            countryName: { color: "#fbfff1" },
            dialCode: { color: "#fbfff1" },
            line: { backgroundColor: "rgba(180, 197, 228, 0.2)" },
          }}
        />
        <Spinner
          visible={loading}
          overlayColor="#000000cc"
          textContent={"Loading"}
          customIndicator={<Loader />}
          textStyle={{ color: "#fff", marginTop: -25 }}
          animation="fade"
        />
      </View>
    </TouchableWithoutFeedback>
  );
}
