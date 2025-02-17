import { PatientMetrics } from "@/backend/models/metrics";
import STATUS_CODES from "@/backend/models/status";
import { User } from "@/backend/models/user";
import { UserType } from "@/backend/models/util";
import Icons from "@expo/vector-icons/Octicons";
import prompt from "@powerdesigninc/react-native-prompt";
import { Picker } from "@react-native-picker/picker";
import Slider from "components/buttons/Slider";
import useCamera from "components/hooks/useCamera";
import useFade from "components/hooks/useFade";
import useGallery from "components/hooks/useGallery";
import { useLoading } from "components/hooks/useLoading";
import { useUser } from "components/hooks/useUser";
import LoaderView from "components/loading/LoaderView";
import {
  callAPI,
  isDoctorInfo,
  isPatientInfo,
  logout,
  uploadImages,
} from "components/utils/Functions";
import { BirthSex, Sex } from "components/utils/Types";
import { Image } from "expo-image";
import { router } from "expo-router";
import parsePhoneNumber from "libphonenumber-js";
import { useColorScheme } from "nativewind";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { CountryPicker } from "react-native-country-codes-picker";
import DropDownPicker from "react-native-dropdown-picker";
import Reanimated, { FadeIn, FadeOut } from "react-native-reanimated";
import Skeleton from "react-native-reanimated-skeleton";

export default function Profile() {
  const camera = useCamera();
  const gallery = useGallery();
  const [countryShow, setCountryShow] = useState(false);
  const [countryCode, setCountryCode] = useState("🇨🇴+57");
  const { user, userEdit, userType, setUser, setUserEdit, fetchUser } =
    useUser();
  const { setLoading } = useLoading();
  const [trans, setTrans] = useState(false);
  const [pictureLoaded, setPictureLoaded] = useState(false);
  const [activeChange, setActiveChange] = useState(false);
  const [altSexValue, setAltSexValue] = useState(Sex.MALE);
  const [altSexOpen, setAltSexOpen] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);
  const { colorScheme } = useColorScheme();
  const [altSexItems, setAltSexItems] = useState(
    Object.values(Sex).map((s) => ({ label: s, value: s })),
  );
  const [pictureLoading, setPictureLoading] = useState(true);
  const fadeAnim = useFade();
  const { t } = useTranslation();
  useEffect(() => {
    if (!user) {
      // Alert.alert(t("error"), t("errors.fetchData"));
      return;
    }
    const fetchData = async () => {
      // setLoading(true);
      if (isPatientInfo(userType as UserType, user)) {
        setTrans(
          user.info.altSex != undefined && user.info.sex !== user.info.altSex,
        );
        setAltSexValue(user.info.sex as Sex);
      }
      // setLoading(false);
    };
    fetchData();
  }, []);
  const updateUser = async () => {
    // NEED TO CHECK IF PATIENT WITH THE USEREDIT
    let doctorStuff = {};
    if (
      userType &&
      userEdit &&
      user &&
      isDoctorInfo(userType, userEdit) &&
      isDoctorInfo(userType, user)
    ) {
      if (userEdit.picture !== user.picture) {
        const res = await uploadImages([userEdit.picture]);
        if (res.status !== STATUS_CODES.SUCCESS) {
          setLoading(false);
          return Alert.alert(
            t("error"),
            t(`errors.${STATUS_CODES[res.status]}`),
          );
        }
        doctorStuff = { picture: res.urls[0] };
      } else {
        doctorStuff = { picture: null };
      }
    }
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
      if (user)
        setUserEdit({
          ...user,
          number: parsePhoneNumber(user.number)?.nationalNumber as string,
        });
      setLoading(false);
      return Alert.alert(t("error"), "errors.updateData");
    } else {
      if (userType && user && isDoctorInfo(userType, user))
        await callAPI(`/images/${user.picture}/delete`, "GET");
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
      return Alert.alert(t("success"), t("successes.updateData"));
    }
  };
  const parseUpdate = async () => {
    setLoading(true);
    //need to check phone number
    if (countryCode.slice(4) + userEdit?.number != user?.number) {
      const verify = await callAPI("/verify/code/send", "POST", {
        number: countryCode.slice(4) + userEdit?.number,
      });
      if (verify.status !== STATUS_CODES.SUCCESS) {
        setLoading(false);
        return Alert.alert(
          t("error"),
          t(`errors.${STATUS_CODES[verify.status]}`),
        );
      }
      setLoading(false);
      setTimeout(() => {
        return prompt(
          t("verification.title"),
          t("verification.description") +
            countryCode.slice(4) +
            userEdit?.number,
          [
            {
              text: t("buttons.cancel"),
              style: "cancel",
              onPress: () => {
                setLoading(false);
              },
            },
            {
              text: t("check"),
              isPreferred: true,
              onPress: async (input) => {
                setLoading(true);
                const v = await callAPI("/verify/code/check", "POST", {
                  number: countryCode.slice(4) + userEdit?.number,
                  code: input,
                });
                if (v.status !== STATUS_CODES.SUCCESS) {
                  setLoading(false);
                  return Alert.alert(
                    t("error"),
                    `errors.${STATUS_CODES[v.status]}`,
                  );
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
    } else await updateUser();
  };
  const selectImage = async (pickerType: "camera" | "gallery") => {
    try {
      let result;
      if (pickerType === "camera") {
        if (!(await camera.requestPermission())) return;
        result = await camera.takePhoto({
          allowsEditing: true,
          quality: 1,
        });
      } else {
        if (!(await gallery.requestPermission())) return;
        result = await gallery.selectImage({
          quality: 1,
          allowsEditing: true,
        });
      }
      setActiveChange(false);
      return result.assets ? result.assets[0].uri : null;
    } catch (error) {
      Alert.alert(t("images.readingTitle"), t("images.readingDescription"));
      console.log(error);
    }
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "position" : "position"}
      style={{ flex: 1 }}
      // keyboardVerticalOffset={Platform.OS === "ios" ? 120 : 0}
    >
      <Animated.View
        style={{ opacity: fadeAnim }}
        className="h-full w-full dark:bg-richer_black bg-ivory"
      >
        <View
          className={
            "absolute w-full p-4 flex justify-between z-50 flex-row " +
            (Platform.OS == "android" ? "mt-8" : "")
          }
        >
          <TouchableOpacity
            onPress={() => router.navigate("/Settings")}
            className="z-50 p-1"
          >
            <Icons
              name="gear"
              size={38}
              color={colorScheme == "light" ? "#020912" : "#fbfff1"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            className="z-50 p-1"
            onPress={() =>
              Alert.alert(
                t("profile.logoutTitle"),
                t("profile.logoutDescription"),
                [
                  { text: t("buttons.cancel"), style: "cancel" },
                  {
                    text: t("profile.logoutTitle"),
                    style: "destructive",
                    onPress: () => logout(),
                  },
                ],
              )
            }
          >
            <Icons
              name="sign-out"
              size={38}
              color={colorScheme == "light" ? "#020912" : "#fbfff1"}
            />
          </TouchableOpacity>
        </View>
        {userType && user ? (
          <Reanimated.ScrollView
            entering={FadeIn.duration(500)}
            exiting={FadeOut.duration(500)}
            className="h-full w-full"
          >
            <TouchableWithoutFeedback
              className="h-full w-full"
              onPress={Keyboard.dismiss}
            >
              <View className="w-full">
                <View className="flex mx-auto pt-8  h-full w-full">
                  <View className="mx-auto bg-transparent w-48 h-48 rounded-full">
                    <View className=" m-auto">
                      {userType == UserType.PATIENT ? (
                        <Icons name="person" size={150} color={colorScheme == 'dark' ? "#fbfff1" : "#020912"} />
                      ) : (
                        user &&
                        userEdit &&
                        isDoctorInfo(userType, user) &&
                        isDoctorInfo(userType, userEdit) && (
                          <TouchableOpacity className=" w-48 h-48  aspect-square flex  rounded-xl">
                              <Image
                                onLoadStart={() => setPictureLoading(true)}
                                onLoad={() => {
                                  setPictureLoading(false);
                                  setPictureLoaded(true);
                                }}
                                onLoadEnd={() => setPictureLoading(false)}
                                className={
                                  "rounded-xl border-dashed border border-ivory/80 h-full aspect-square"
                                }
                                source={userEdit.picture}
                              />

                              {pictureLoading && (
                                <View className=" rounded-xl w-48 h-48  z-50 absolute  flex">
                                  <Skeleton
                                    animationType="shiver"
                                    boneColor={
                                      colorScheme == "dark"
                                        ? "#041225"
                                        : "rgba(91, 149, 165, 0.2)"
                                    }
                                    highlightColor="#b4c5e4"
                                    layout={[
                                      {
                                        borderRadius: 12,
                                        width: 192,
                                        height: 192,
                                      },
                                    ]}
                                    isLoading={pictureLoading}
                                  >
                                    <View className="m-auto w-48 h-48">
                                      <Icons
                                        name="person"
                                        size={150}
                                        color={"#fbfff1"}
                                      />
                                    </View>
                                  </Skeleton>
                                </View>
                              )}
                              {(!pictureLoaded && !pictureLoading || user.picture == "") && (
                                <View className="absolute rounded-xl w-48 h-48  z-50  flex">
                                  <View className="m-auto ">
                                    <Icons
                                      name="person"
                                      size={150}
                                      color={"#fbfff1"}
                                    />
                                  </View>
                                </View>
                              )}
                              <Pressable
                                disabled={pictureLoading}
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
                                        Alert.alert(
                                          t("images.choose"),
                                          undefined,
                                          [
                                            {
                                              text: t("images.gallery"),
                                              onPress: async () =>
                                                setUserEdit({
                                                  ...userEdit,
                                                  picture:
                                                    (await selectImage(
                                                      "gallery",
                                                    )) ?? userEdit.picture,
                                                }),
                                            },
                                            {
                                              text: t("images.camera"),
                                              onPress: async () =>
                                                setUserEdit({
                                                  ...userEdit,
                                                  picture:
                                                    (await selectImage(
                                                      "camera",
                                                    )) ?? userEdit.picture,
                                                }),
                                            },
                                            {
                                              text: t("buttons.cancel"),
                                              style: "cancel",
                                            },
                                          ],
                                        )
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
                          </TouchableOpacity>
                        )
                      )}
                    </View>
                  </View>
                  {userEdit && (
                    <>
                      {isDoctorInfo(userType, userEdit) && (
                        <Text className="text-2xl mt-4 -mb-2 dark:text-ivory text-richer_black font-semibold text-center">
                          {userEdit.name}
                        </Text>
                      )}
                      <Text
                        className={
                          " mt-2 dark:text-ivory text-richer_black  text-center " +
                          (isDoctorInfo(userType, userEdit)
                            ? "text-xl font-medium"
                            : "text-2xl font-semibold")
                        }
                      >
                        {user?.identification.number}
                      </Text>
                      <View className="h-0.5 rounded-full w-72 mx-auto bg-powder_blue/50 my-4" />
                      <Text className="text-center text-lg dark:text-ivory text-richer_black  font-semibold">
                        {t("inputs.number")}
                      </Text>
                      <View className="flex flex-row justify-center align-middle -mt-3  ">
                        <TouchableOpacity
                          onPress={() => setCountryShow(!countryShow)}
                          className=" dark:bg-rich_black/80 bg-prussian_blue border dark:border-powder_blue/20 border-oxforder_blue/25 border-r-0 text-center align-middle p-1 h-12 mt-3 w-3/12 rounded-l-xl"
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
                          className="flex justify-center align-middle  my-auto ml-0 h-12 p-1 py-2.5 pl-3 text-xl mt-3 w-7/12   rounded-xl rounded-l-none dark:bg-rich_black/80 bg-prussian_blue text-ivory border dark:border-powder_blue/20 border-oxforder_blue/25 font-semibold"
                        />
                      </View>
                    </>
                  )}
                  {/* <ScrollView
                onScrollBeginDrag={Keyboard.dismiss}
                onScrollEndDrag={Keyboard.dismiss}
                className=" h-48 mt-4 mx-auto flex"
              > */}
                  {userEdit && isPatientInfo(userType, userEdit) ? (
                    <View className="pb-56">
                      {/* <ScrollView contentContainerStyle={{justifyContent: "center", flex: 1}} className="flex w-full flex-row"> */}
                      <View>
                        <View className="flex w-full flex-row h-fit ">
                          <View className="w-1/2 flex flex-col">
                            <Text className="text-center text-lg dark:text-ivory text-richer_black  mt-4 font-semibold">
                              {t("inputs.height")}
                            </Text>

                            <TextInput
                              onChangeText={(h) =>
                                setUserEdit({
                                  ...userEdit,
                                  info: {
                                    ...userEdit.info,
                                    height: isNaN(parseInt(h))
                                      ? 0
                                      : parseInt(h),
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
                              className="flex justify-center align-middle text-center  m-auto h-12 py-2.5 text-xl mt-2 w-6/12   rounded-xl dark:bg-rich_black/80 bg-prussian_blue text-ivory border dark:border-powder_blue/20 border-oxforder_blue/25 font-semibold"
                            />
                          </View>
                          <View className="w-1/2 flex flex-col">
                            <Text className="text-center text-lg dark:text-ivory text-richer_black  mt-4 font-semibold">
                              {t("inputs.weight")}
                            </Text>

                            <TextInput
                              onChangeText={(w) =>
                                setUserEdit({
                                  ...userEdit,
                                  info: {
                                    ...userEdit.info,
                                    weight: isNaN(parseInt(w))
                                      ? 0
                                      : parseInt(w),
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
                              className="flex justify-center align-middle text-center  m-auto h-12 py-2.5 text-xl mt-2 w-6/12   rounded-xl dark:bg-rich_black/80 bg-prussian_blue text-ivory border dark:border-powder_blue/20 border-oxforder_blue/25 font-semibold"
                            />
                          </View>
                        </View>
                        {(userEdit.info.sex == BirthSex.FEMALE ||
                          (userEdit.info.surgery &&
                            userEdit.info.altSex == BirthSex.FEMALE)) && (
                          <View className="flex flex-col">
                            <Text className="text-center text-lg dark:text-ivory text-richer_black  mt-4 font-semibold">
                              {t("inputs.pregnant")}
                            </Text>
                            <Slider
                              options={[t("yes"), t("no")]}
                              setOption={(v) =>
                                setUserEdit({
                                  ...userEdit,
                                  info: {
                                    ...userEdit.info,
                                    pregnant: v == t("yes"),
                                  },
                                })
                              }
                              selected={
                                userEdit.info.pregnant ? t("yes") : t("no")
                              }
                            />
                          </View>
                        )}
                      </View>
                      <View className="mx-auto flex mt-4 ">
                        <Text className=" w-96 text-center mx-auto flex-shrink text-lg mb-4  dark:text-ivory text-richer_black font-semibold">
                          {t("inputs.trans")}
                        </Text>
                        <Slider
                          options={[t("yes"), t("no")]}
                          setOption={(v) => {
                            setTrans(v == t("yes"));
                            setUserEdit({
                              ...userEdit,
                              info:
                                v == t("yes")
                                  ? { ...(userEdit?.info as PatientMetrics) }
                                  : {
                                      ...userEdit.info,
                                      altSex: userEdit.info.sex,
                                      hormones: false,
                                      surgery: false,
                                      pregnant:
                                        userEdit.info.sex == BirthSex.FEMALE
                                          ? userEdit.info.pregnant
                                          : false,
                                    },
                            });
                          }}
                          selected={trans ? t("yes") : t("no")}
                        />
                        {trans && (
                          <Reanimated.View entering={FadeIn.duration(500)}>
                            <View className="flex flex-row justify-center w-fit mx-auto ">
                              {Platform.OS == "ios" ? (
                                <Picker
                                  selectedValue={userEdit.info.altSex}
                                  style={{ width: 100 }}
                                  onValueChange={(v) =>
                                    setUserEdit({
                                      ...userEdit,
                                      info: { ...userEdit.info, altSex: v },
                                    })
                                  }
                                >
                                  <Picker.Item
                                    style={{ backgroundColor: "#041225" }}
                                    color={
                                      colorScheme == "dark"
                                        ? "#fbfff1"
                                        : "#023c4d"
                                    }
                                    label="M"
                                    value={Sex.MALE}
                                  />
                                  <Picker.Item
                                    color={
                                      colorScheme == "dark"
                                        ? "#fbfff1"
                                        : "#023c4d"
                                    }
                                    label="F"
                                    value={Sex.FEMALE}
                                  />
                                  <Picker.Item
                                    color={
                                      colorScheme == "dark"
                                        ? "#fbfff1"
                                        : "#023c4d"
                                    }
                                    label="NB"
                                    value={Sex.NONBINARY}
                                  />
                                  <Picker.Item
                                    color={
                                      colorScheme == "dark"
                                        ? "#fbfff1"
                                        : "#023c4d"
                                    }
                                    label="O"
                                    value={Sex.OTHER}
                                  />
                                </Picker>
                              ) : (
                                <DropDownPicker
                                  open={altSexOpen}
                                  value={altSexValue}
                                  items={altSexItems}
                                  listMode="SCROLLVIEW"
                                  setOpen={setAltSexOpen}
                                  setValue={setAltSexValue}
                                  onChangeValue={(v) => {
                                    setUserEdit({
                                      ...userEdit,
                                      info: {
                                        ...userEdit.info,
                                        altSex: v as Sex,
                                      },
                                    });
                                    scrollRef.current?.scrollToEnd();
                                  }}
                                  theme="DARK"
                                  textStyle={{ color: "#fbfff1" }}
                                  style={{ backgroundColor: "#041225" }}
                                  badgeColors={"#fbfff1"}
                                  labelStyle={{ textAlign: "center" }}
                                  containerStyle={{ width: 80, marginTop: 32 }}
                                  listParentContainerStyle={{ height: 36 }}
                                  listItemContainerStyle={{
                                    backgroundColor: "#041225",
                                  }}
                                  setItems={setAltSexItems}
                                />
                              )}
                            </View>
                            <Text className="text-center w-10/12 mx-auto text-lg my-4 dark:text-ivory text-richer_black font-semibold">
                              {t("inputs.hormones")}
                            </Text>
                            <Slider
                              options={[t("yes"), t("no")]}
                              setOption={(v) =>
                                setUserEdit({
                                  ...userEdit,
                                  info: {
                                    ...userEdit.info,
                                    hormones: v == t("yes"),
                                  },
                                })
                              }
                              selected={
                                userEdit.info.hormones ? t("yes") : t("no")
                              }
                            />
                            <Text className="text-center w-10/12 mx-auto text-lg my-4 dark:text-ivory text-richer_black font-semibold">
                              {t("inputs.surgery")}
                            </Text>
                            <Slider
                              options={[t("yes"), t("no")]}
                              setOption={(v) =>
                                setUserEdit({
                                  ...userEdit,
                                  info: {
                                    ...userEdit.info,
                                    surgery: v == t("yes"),
                                  },
                                })
                              }
                              selected={
                                userEdit.info.surgery ? t("yes") : t("no")
                              }
                            />
                          </Reanimated.View>
                        )}
                      </View>
                    </View>
                  ) : (
                    // </ScrollView>
                    userEdit &&
                    isDoctorInfo(userType, userEdit) && (
                      <View className="flex">
                        <Text className="text-center text-lg dark:text-ivory text-richer_black -mb-3 mt-4 font-semibold">
                          {t("inputs.experience")}
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
                          className="flex justify-center align-middle  m-auto h-12 p-1 py-2.5 pl-3 text-xl mt-3 w-10/12   rounded-xl dark:bg-rich_black/80 bg-prussian_blue text-ivory border dark:border-powder_blue/20 border-oxforder_blue/25 font-semibold"
                        />
                        <Text className="text-center flex text-lg dark:text-ivory text-richer_black -mb-3 mt-4 font-semibold">
                          {t("inputs.bio")} ({userEdit.info.about.length}/300)
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
                          className="flex justify-center align-middle  m-auto mb-52 h-52 p-1 py-2.5 pl-3 text-lg mt-3 w-10/12   rounded-xl dark:bg-rich_black/80 bg-prussian_blue text-ivory border dark:border-powder_blue/20 border-oxforder_blue/25 font-semibold"
                        />
                      </View>
                    )
                  )}
                  {/* </ScrollView> */}
                </View>

                <CountryPicker
                  show={countryShow}
                  // when picker button press you will get the country object with dial code
                  pickerButtonOnPress={(item: {
                    flag: any;
                    dial_code: any;
                  }) => {
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
              </View>
            </TouchableWithoutFeedback>
          </Reanimated.ScrollView>
        ) : (
          <LoaderView />
        )}
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
                    "  bg-oxford_blue mx-auto px-32 py-2.5 transition-all duration-300 rounded-lg "
                  }
                >
                  <Text className="text-xl  text-ivory  font-medium text-center">
                    {t("buttons.update")}
                  </Text>
                </TouchableOpacity>
              </Reanimated.View>
            </View>
          )}
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
