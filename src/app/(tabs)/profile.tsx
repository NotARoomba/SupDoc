import { STATUS_CODES } from "@/backend/models/util";
import {
  callAPI,
  isDoctorInfo,
  isPatientInfo,
  logout,
} from "components/utils/Functions";
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
  Animated,
  Pressable,
  ScrollView,
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
import Slider from "components/buttons/Slider";
import Reanimated, { FadeIn, FadeOut } from "react-native-reanimated";
import prompt from "@powerdesigninc/react-native-prompt";
import useFade from "components/misc/useFade";
import { Image } from "expo-image";
import useCamera from "components/misc/useCamera";
import useGallery from "components/misc/useGallery";
import * as FileSystem from "expo-file-system";

export default function Profile() {
  const camera = useCamera();
  const gallery = useGallery();
  const [userType, setUserType] = useState<UserType>();
  const [countryShow, setCountryShow] = useState(false);
  const [countryCode, setCountryCode] = useState("🇨🇴+57");
  const [user, setUser] = useState<User>();
  const [userEdit, setUserEdit] = useState<User>();
  const [loading, setLoading] = useState(true);
  const [activeChange, setActiveChange] = useState(false);
  const fadeAnim = useFade();
  useEffect(() => {
    // setLoading(true);
    const fetchData = async () => {
      const ut = (await SecureStore.getItemAsync(
        process.env.EXPO_PUBLIC_KEY_NAME_TYPE,
      )) as UserType;
      const res = await callAPI(
        `/${ut == UserType.DOCTOR ? "doctors" : "patients"}/`,
        "GET",
      );
      if (res.status == STATUS_CODES.USER_NOT_FOUND) {
        setLoading(false);
        return await logout();
      } else if (res.status == STATUS_CODES.GENERIC_ERROR) {
        setLoading(false);
        return Alert.alert("Error", "There was an error fetching your data!");
      }
      setUser(res.user);
      setUserEdit({
        ...res.user,
        number: parsePhoneNumber(res.user.number)?.nationalNumber,
      });
      console.log("ASDASDASD");
      setUserType(ut);
      setLoading(false);
    };
    fetchData();
  }, []);
  const updateUser = async () => {
    // NEED TO CHECK IF PATIENT WITH THE USEREDIT
    const doctorStuff =
      userType && userEdit && isDoctorInfo(userType, userEdit)
        ? {
            picture: await FileSystem.readAsStringAsync(userEdit.picture, {
              encoding: "base64",
            }),
          }
        : {};
    const res = await callAPI(
      `/${userType == UserType.DOCTOR ? "doctors" : "patients"}/update`,
      "POST",
      {
        ...userEdit,
        ...doctorStuff,
        number: countryCode.slice(4) + userEdit?.number,
      },
    );
    if (res.status != STATUS_CODES.SUCCESS) {
      setUserEdit(user);
      setLoading(false);
      return Alert.alert(
        "Error",
        "There was an error updating your information!",
      );
    } else {
      setUser(res.user);
      setUserEdit({
        ...res.user,
        number: parsePhoneNumber(res.user.number)?.nationalNumber,
      });
      setCountryCode(
        [...(parsePhoneNumber(res.user.number)?.country ?? "CO").toUpperCase()]
          .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
          .reduce(
            (a, b) =>
              `${a}${b}+${parsePhoneNumber(res.user.number)?.countryCallingCode}`,
          ),
      );
      setLoading(false);
      return Alert.alert("Success", "Successfully updated your information!");
    }
  };
  const parseUpdate = async () => {
    setLoading(true);
    //need to check phone number
    if (countryCode.slice(4) + userEdit?.number != user?.number) {
      const verify = await callAPI("/verify/code/send", "POST", {
        number: countryCode.slice(4) + userEdit?.number,
      });
      if (verify.status === STATUS_CODES.INVALID_NUMBER) {
        setLoading(false);
        return Alert.alert("Error", "That number is invalid!");
      } else if (verify.status === STATUS_CODES.NUMBER_NOT_EXIST) {
        setLoading(false);
        return Alert.alert("Error", "That number does not exist!");
      } else if (verify.status === STATUS_CODES.ERROR_SENDING_CODE) {
        setLoading(false);
        return Alert.alert("Error", "There was an error sending the code!");
      } else {
        setLoading(false);
        setTimeout(() => {
          return prompt(
            "Enter Verification Code",
            "Enter the verification code sent to: " +
              countryCode.slice(4) +
              userEdit?.number,
            [
              {
                text: "Cancel",
                style: "cancel",
                onPress: () => {
                  setLoading(false);
                },
              },
              {
                text: "Check",
                isPreferred: true,
                onPress: async (input) => {
                  setLoading(true);
                  const v = await callAPI("/verify/code/check", "POST", {
                    number: countryCode.slice(4) + userEdit?.number,
                    input,
                  });
                  if (v.status !== STATUS_CODES.SUCCESS) {
                    setLoading(false);
                    return Alert.alert("Error", "The code is incorrect!");
                  }
                  updateUser();
                },
              },
            ],
            "plain-text",
            "",
            "number-pad",
          );
        }, 250);
      }
    } else await updateUser();
  };
  const selectImage = async (pickerType: "camera" | "gallery") => {
    if (
      !(await camera.requestPermission()) &&
      pickerType == "camera" &&
      !(await gallery.requestPermission()) &&
      pickerType !== "camera"
    )
      return console.log("NO PHOTOS");
    try {
      let result;
      if (pickerType === "camera") {
        result = await camera.takePhoto({
          allowsEditing: true,
          quality: 0.5,
        });
      } else {
        result = await gallery.selectImage({
          quality: 0.5,
          allowsEditing: true,
        });
      }
      setActiveChange(false);
      return result.assets ? result.assets[0].uri : null;
    } catch (error) {
      Alert.alert("Image error", "Error reading image");
      console.log(error);
    }
  };
  return (
    <Animated.View style={{ opacity: fadeAnim }} className="h-full w-full">
      <View className="absolute w-full p-4 flex justify-between z-50 flex-row">
        <TouchableOpacity className="z-50 p-1">
          <Icons name="info" size={38} color={"#fbfff1"} />
        </TouchableOpacity>
        <TouchableOpacity
          className="z-50 p-1"
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
      {userType && (
        <TouchableWithoutFeedback
          className="h-full w-full"
          onPress={Keyboard.dismiss}
        >
          <View className="w-full">
            <View className="flex mx-auto pt-8  h-full w-full">
              <View className="mx-auto bg-transparent w-48 h-48 rounded-full">
                <View className=" m-auto">
                  {userType == UserType.PATIENT ? (
                    <Icons name="person" size={150} color={"#fbfff1"} />
                  ) : (
                    user &&
                    userEdit &&
                    isDoctorInfo(userType, user) &&
                    isDoctorInfo(userType, userEdit) && (
                      <TouchableOpacity className=" w-48 h-48  aspect-square flex border-dashed border border-ivory/80 rounded-xl">
                        <View className="m-auto">
                          <Image
                            className="rounded-xl h-full aspect-square"
                            source={{
                              uri: `${userEdit.picture !== user.picture ? userEdit.picture : `data:image/png;base64,${userEdit.picture}`}`,
                            }}
                          />
                          <Pressable
                            onPress={() => setActiveChange(!activeChange)}
                            className="absolute rounded-xl w-48 h-48  z-50  flex"
                          >
                            {activeChange && (
                              <Reanimated.View
                                entering={FadeIn.duration(250)}
                                exiting={FadeOut.duration(250)}
                                className="h-full rounded-xl w-full bg-ivory/50"
                              >
                                <TouchableOpacity
                                  onPress={() =>
                                    Alert.alert("Please choose", undefined, [
                                      {
                                        text: "Gallery",
                                        onPress: async () =>
                                          setUserEdit({
                                            ...userEdit,
                                            picture:
                                              (await selectImage("gallery")) ??
                                              userEdit.picture,
                                          }),
                                      },
                                      {
                                        text: "Camera",
                                        onPress: async () =>
                                          setUserEdit({
                                            ...userEdit,
                                            picture:
                                              (await selectImage("camera")) ??
                                              userEdit.picture,
                                          }),
                                      },
                                      { text: "Cancel", style: "cancel" },
                                    ])
                                  }
                                  className="m-auto p-4"
                                >
                                  <Icons
                                    name="pencil"
                                    size={60}
                                    color={"#08254099"}
                                  />
                                </TouchableOpacity>
                              </Reanimated.View>
                            )}
                          </Pressable>
                        </View>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </View>
              {userEdit && (
                <>
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
                      value={userEdit.number}
                      keyboardType="phone-pad"
                      placeholderTextColor={"#ffffff"}
                      className="flex justify-center align-middle  my-auto ml-0 h-12 p-1 py-2.5 pl-3 text-xl mt-3 w-7/12   rounded-xl rounded-l-none bg-rich_black text-ivory border border-powder_blue/20 font-semibold"
                    />
                  </View>
                </>
              )}
              <ScrollView onScrollBeginDrag={Keyboard.dismiss} onScrollEndDrag={Keyboard.dismiss} className=" h-52">
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
                              ...userEdit,
                              info: {
                                ...userEdit.info,
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
                userEdit &&
                isDoctorInfo(userType, userEdit) && (
                  <View className="flex">
                    <Text className="text-center text-lg text-ivory -mb-3 mt-4 font-semibold">
                      Specialty
                    </Text>
                    <TextInput
                      onChangeText={(n) =>
                        setUserEdit({
                          ...userEdit,
                          info: { ...userEdit.info, specialty: n },
                        })
                      }
                      value={userEdit.info.specialty}
                      keyboardType="default"
                      placeholderTextColor={"#ffffff"}
                      className="flex justify-center align-middle  m-auto h-12 p-1 py-2.5 pl-3 text-xl mt-3 w-10/12   rounded-xl bg-rich_black text-ivory border border-powder_blue/20 font-semibold"
                    />
                    <Text className="text-center text-lg text-ivory -mb-3 mt-4 font-semibold">
                      Experience
                    </Text>
                    <TextInput
                      onChangeText={(n) =>
                        setUserEdit({
                          ...userEdit,
                          info: { ...userEdit.info, experience: n },
                        })
                      }
                      value={userEdit.info.experience}
                      keyboardType="default"
                      placeholderTextColor={"#ffffff"}
                      className="flex justify-center align-middle  m-auto h-12 p-1 py-2.5 pl-3 text-xl mt-3 w-10/12   rounded-xl bg-rich_black text-ivory border border-powder_blue/20 font-semibold"
                    />
                    <Text className="text-center flex text-lg text-ivory -mb-3 mt-4 font-semibold">
                      Bio ({userEdit.info.about.length}/300)
                    </Text>
                    <TextInput
                      onChangeText={(n) =>
                        setUserEdit({
                          ...userEdit,
                          info: { ...userEdit.info, about: n },
                        })
                      }
                      maxLength={300}
                      multiline
                      value={userEdit.info.about}
                      keyboardType="default"
                      placeholderTextColor={"#ffffff"}
                      className="flex justify-center align-middle  m-auto mb-52 h-52 p-1 py-2.5 pl-3 text-lg mt-3 w-10/12   rounded-xl bg-rich_black text-ivory border border-powder_blue/20 font-semibold"
                    />
                  </View>
                )
              )}</ScrollView>
              {userEdit &&
                JSON.stringify({
                  ...userEdit,
                  number: countryCode.slice(4) + userEdit.number,
                } as User) != JSON.stringify(user) && (
                  <View
                    className={
                      "flex flex-col absolute gap-y-4 w-full z-10 left-0 bottom-32"
                    }
                  >
                    <Reanimated.View
                      entering={FadeIn.duration(500)}
                      exiting={FadeOut.duration(500)}
                      className="mt-5"
                    >
                      <TouchableOpacity
                        onPress={parseUpdate}
                        className={
                          "  bg-oxforder_blue mx-auto px-32 py-2.5 transition-all duration-300 rounded-lg "
                        }
                      >
                        <Text className="text-xl  text-ivory font-medium text-center">
                          Update
                        </Text>
                      </TouchableOpacity>
                    </Reanimated.View>
                  </View>
                )}
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
      )}
    </Animated.View>
  );
}
