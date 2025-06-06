import { Specialty } from "@/backend/models/specialty";
import STATUS_CODES from "@/backend/models/status";
import { UserType } from "@/backend/models/util";
import Icons from "@expo/vector-icons/Octicons";
import prompt from "@powerdesigninc/react-native-prompt";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import Slider from "components/buttons/Slider";
import useCamera from "components/hooks/useCamera";
import useGallery from "components/hooks/useGallery";
import { useLoading } from "components/hooks/useLoading";
import ImageUpload from "components/misc/ImageUpload";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useColorScheme } from "nativewind";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Dimensions,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CountryPicker } from "react-native-country-codes-picker";
import DropDownPicker from "react-native-dropdown-picker";
import Animated, {
  FadeIn,
  FadeInLeft,
  FadeInUp,
  FadeOut,
  FadeOutLeft,
} from "react-native-reanimated";
import {
  callAPI,
  isDoctorSignupInfo,
  isPatientSignupInfo,
} from "../components/utils/Functions";
import { BirthSex, GS, Sex, SignupProps } from "../components/utils/Types";

export default function Signup({
  info,
  index,
  userType,
  setInfo,
  setIndex,
}: SignupProps) {
  /// setInfo({...info, info.(PROPIEDAD Q QUIERES CAMBIAR)})
  const [show, setShow] = useState(false);
  const camera = useCamera();
  const gallery = useGallery();
  const [countryCode, setCountryCode] = useState("🇨🇴+57");
  const { setLoading } = useLoading();
  const [gsValue, setGSValue] = useState(GS.O);
  const [gsOpen, setGSOpen] = useState(false);
  const [verified, setIsVerified] = useState(false);
  const [activeChange, setActiveChange] = useState(false);
  const [activeDelete, setActiveDelete] = useState("");
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const [gsItems, setGSItems] = useState(
    Object.values(GS).map((s) => ({ label: s, value: s }))
  );
  const [rhValue, setRhValue] = useState("+");
  const [rhOpen, setRhOpen] = useState(false);
  const [rhItems, setRhItems] = useState([
    { label: "+", value: "+" },
    { label: "-", value: "-" },
  ]);

  // Sex States
  const [sexValue, setSexValue] = useState(BirthSex.MALE);
  const [sexOpen, setSexOpen] = useState(false);
  const [sexItems, setSexItems] = useState(
    Object.values(BirthSex).map((s) => ({ label: s, value: s }))
  );

  const [altSexValue, setAltSexValue] = useState(Sex.MALE);
  const [altSexOpen, setAltSexOpen] = useState(false);
  const [altSexItems, setAltSexItems] = useState(
    Object.values(Sex).map((s) => ({ label: s, value: s }))
  );

  // Pregnancy Status States
  const [isPregnantValue, setIsPregnantValue] = useState(false);
  const [isPregnantOpen, setIsPregnantOpen] = useState(false);
  const [isPregnantItems, setIsPregnantItems] = useState([
    { label: t("yes"), value: true },
    { label: t("no"), value: false },
  ]);

  const [specialtyValue, setSpecialtyValue] = useState(
    Specialty.GeneralPractitioner
  ); // Default value
  const [specialtyOpen, setSpecialtyOpen] = useState(false);
  const [specialtyItems, setSpecialtyItems] = useState(
    Object.values(Specialty).map((s) => ({ label: s, value: s }))
  );

  useEffect(() => {
    const doChecks = async () => {
      if (index == 3) {
        setLoading(true);
        const res = await callAPI(`/users/check`, "POST", {
          number: info.countryCode + info.number,
          id: info.identification,
        });
        if (res.status !== STATUS_CODES.SUCCESS) {
          setIndex(index - 1);
          setLoading(false);
          return Alert.alert(
            t("error"),
            t(`errors.${STATUS_CODES[res.status]}`)
          );
        }
        if (!verified) {
          const isValid =
            /^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/.test(
              info.number
            );
          if (!isValid) {
            setIndex(index - 1);
            setLoading(false);
            return Alert.alert(t("error"), t("errors.INVALID_NUMBER"));
          }
          const verify = await callAPI("/verify/code/send", "POST", {
            number: info.countryCode + info.number,
          });
          if (verify.status === STATUS_CODES.INVALID_NUMBER) {
            setIndex(index - 1);
            setLoading(false);
            return Alert.alert(
              t("error"),
              t(`errors.${STATUS_CODES[verify.status]}`)
            );
          } else if (verify.status === STATUS_CODES.NUMBER_NOT_EXIST) {
            setIndex(index - 1);
            setLoading(false);
            return Alert.alert(
              t("error"),
              t(`errors.${STATUS_CODES[verify.status]}`)
            );
          } else if (verify.status === STATUS_CODES.ERROR_SENDING_CODE) {
            setIndex(index - 1);
            setLoading(false);
            return Alert.alert(
              t("error"),
              t(`errors.${STATUS_CODES[verify.status]}`)
            );
          } else if (verify.status !== STATUS_CODES.SUCCESS) {
            setIndex(index - 1);
            setLoading(false);
            return Alert.alert(
              t("error"),
              t(`errors.${STATUS_CODES[verify.status]}`)
            );
          } else {
            setTimeout(() => {
              return prompt(
                t("inputs.enterCode"),
                t("inputs.enterCode2") + (info.countryCode + info.number),
                [
                  {
                    text: t("buttons.cancel"),
                    style: "cancel",
                    onPress: () => {
                      setIndex(index - 1);
                      setLoading(false);
                    },
                  },
                  {
                    text: t("check"),
                    isPreferred: true,
                    onPress: async (input) => {
                      setLoading(true);
                      const v = await callAPI("/verify/code/check", "POST", {
                        number: info.countryCode + info.number,
                        code: input,
                      });
                      setLoading(false);
                      if (v.status !== STATUS_CODES.SUCCESS) {
                        setIndex(index - 1);
                        return Alert.alert(
                          (t("error"), t(`errors.${STATUS_CODES[v.status]}`))
                        );
                      }
                      setIsVerified(true);
                    },
                  },
                ],
                "plain-text",
                "",
                "number-pad"
              );
            }, 250);
          }
        }
        setLoading(false);
      } else if (
        index == 4 &&
        userType == UserType.DOCTOR &&
        isDoctorSignupInfo(userType, info)
      ) {
        // MAKE THIS HAPPEN IN THE BACKGROUND WITH NOTIFICATIONS
        setLoading(true);
        const res = await callAPI(`/verify/doctor`, "POST", {
          id: info.identification,
          name: info.firstName + " " + info.lastName,
        });
        if (res.status !== STATUS_CODES.SUCCESS) {
          setLoading(false);
          setIndex(3);
          return Alert.alert(
            t("error"),
            t(`errors.${STATUS_CODES[res.status]}`)
          );
        }
        setInfo({ ...info, specialty: res.specialty });
        setLoading(false);
      }
    };
    doChecks();
  }, [index]);
  const selectImage = async (pickerType: "camera" | "gallery") => {
    try {
      let result;
      if (pickerType === "camera") {
        if (!(await camera.requestPermission())) return;
        result = await camera.takePhoto({
          allowsEditing: true,
          quality: 1,
        } as ImagePicker.ImagePickerOptions);
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
  const removeImage = (image: string) =>
    isDoctorSignupInfo(userType, info) &&
    setInfo({ ...info, license: info.license.filter((v) => v !== image) });
  return (
    <View className="h-full flex ">
      <Animated.Text
        entering={FadeIn.duration(500)}
        key={index}
        className="text-5xl dark:text-ivory text-richer_black font-bold text-center mb-4"
      >
        {index == 2 ? t("titles.register") : t("titles.personal")}
      </Animated.Text>
      {index == 2 ? (
        <Animated.View entering={FadeIn.duration(500)}>
          {/* needs to show a text box to input a phone number and identificatio number */}
          <Text className="text-center text-lg dark:text-ivory text-richer_black -mb-3 font-semibold">
            {t("inputs.number")}
          </Text>
          <View className="flex flex-row justify-center m-auto align-middle  ">
            <TouchableOpacity
              onPress={() => setShow(!show)}
              className=" dark:bg-rich_black bg-prussian_blue border border-powder_blue/20 border-r-0 text-center align-middle p-1 h-12 mt-3 w-3/12 rounded-l-xl"
            >
              <Text className="align-middle m-auto text-lg text-ivory font-semibold">
                {countryCode}
              </Text>
            </TouchableOpacity>
            <TextInput
              onChangeText={(n) => {
                setIsVerified(false);
                setInfo({ ...info, number: n });
              }}
              value={info.number}
              keyboardType="phone-pad"
              placeholderTextColor={"#ffffff"}
              className="flex justify-center align-middle  my-auto ml-0 h-12 p-1 py-2.5 pl-3 text-xl mt-3 w-7/12   rounded-xl rounded-l-none dark:bg-rich_black/80 bg-prussian_blue text-ivory border border-powder_blue/20 font-semibold"
            />
          </View>
          <Text className="text-center text-lg dark:text-ivory text-richer_black -mb-3 mt-4 font-semibold">
            {userType == UserType.DOCTOR
              ? t("inputs.identification")
              : t("inputs.identification") + t("inputs.TI")}
          </Text>
          <TextInput
            onChangeText={(identification) =>
              setInfo({
                ...info,
                identification,
              })
            }
            value={info.identification}
            keyboardType="phone-pad"
            placeholderTextColor={"#ffffff"}
            className="flex justify-center align-middle  m-auto h-12 p-1 py-2.5 pl-3 text-xl mt-3 w-10/12   rounded-xl dark:bg-rich_black/80 bg-prussian_blue text-ivory border border-powder_blue/20 font-semibold"
          />
        </Animated.View>
      ) : isPatientSignupInfo(userType, info) ? (
        index == 3 ? (
          <Animated.View
            entering={FadeIn.duration(500)}
            className={"h-full flex flex-col"}
          >
            <Text className="text-center text-lg dark:text-ivory text-richer_black mb-2 mt-0 font-semibold">
              {t("inputs.dob")}
            </Text>
            <View className="flex w-full justify-center">
              {Platform.OS == "ios" ? (
                <DateTimePicker
                  value={new Date(info.dob ?? new Date())}
                  maximumDate={new Date()}
                  onChange={(e, d) => {
                    setInfo({ ...info, dob: d ? d.getTime() : info.dob });
                  }}
                  style={{
                    marginHorizontal: "auto",
                    transform: [{ translateX: -4 }],
                  }}
                />
              ) : (
                <TouchableOpacity
                  onPress={() =>
                    DateTimePickerAndroid.open({
                      value: new Date(info.dob ?? new Date()),
                      maximumDate: new Date(),
                      onChange: (d) => {
                        setInfo({ ...info, dob: d.nativeEvent.timestamp });
                      },
                    })
                  }
                  className="bg-neutral-800/80 rounded-lg py-0.5 px-3 w-fit mx-auto"
                >
                  <Text className="dark:text-ivory text-richer_black text-lg">
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).format(new Date(info.dob ?? new Date()))}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <View className="flex w-full flex-row">
              <View className="w-1/2 flex flex-col">
                <Text className="text-center text-lg dark:text-ivory text-richer_black  mt-4 font-semibold">
                  {t("inputs.height")}
                </Text>

                <TextInput
                  onChangeText={(h) =>
                    setInfo({
                      ...info,
                      height: isNaN(parseInt(h)) ? 0 : parseInt(h),
                    })
                  }
                  value={info.height == 0 ? "" : info.height.toString()}
                  maxLength={3}
                  keyboardType="phone-pad"
                  placeholderTextColor={"#ffffff"}
                  className="flex justify-center align-middle text-center  m-auto h-12 py-2.5 text-xl mt-2 w-6/12   rounded-xl dark:bg-rich_black/80 bg-prussian_blue text-ivory border border-powder_blue/20 font-semibold"
                />
                <Text className="text-center text-lg dark:text-ivory text-richer_black  mt-4 font-semibold">
                  {t("inputs.blood")}
                </Text>
                <View className="flex flex-row justify-center mx-auto -mt-6">
                  {Platform.OS == "ios" ? (
                    <>
                      <Picker
                        className="h-12 dark:text-ivory text-richer_black flex justify-center text-center mx-auto rounded-lg"
                        selectedValue={info.gs}
                        style={{
                          width: 100,
                          color: "#fbfff1",
                        }}
                        mode="dropdown"
                        dropdownIconColor={"#fbfff1"}
                        onValueChange={(v) => setInfo({ ...info, gs: v })}
                      >
                        <Picker.Item
                          style={{ backgroundColor: "#041225" }}
                          color={colorScheme == "dark" ? "#fbfff1" : "#023c4d"}
                          label="O"
                          value="O"
                        />
                        <Picker.Item
                          style={{ backgroundColor: "#041225" }}
                          color={colorScheme == "dark" ? "#fbfff1" : "#023c4d"}
                          label="A"
                          value="A"
                        />
                        <Picker.Item
                          style={{ backgroundColor: "#041225" }}
                          color={colorScheme == "dark" ? "#fbfff1" : "#023c4d"}
                          label="B"
                          value="B"
                        />
                        <Picker.Item
                          style={{ backgroundColor: "#041225" }}
                          color={colorScheme == "dark" ? "#fbfff1" : "#023c4d"}
                          label="AB"
                          value="AB"
                        />
                      </Picker>
                      <Picker
                        selectedValue={info.rh}
                        style={{ width: 100 }}
                        mode="dropdown"
                        onValueChange={(v) => setInfo({ ...info, rh: v })}
                      >
                        <Picker.Item
                          style={{ backgroundColor: "#041225" }}
                          color={colorScheme == "dark" ? "#fbfff1" : "#023c4d"}
                          label="-"
                          value="-"
                        />
                        <Picker.Item
                          style={{ backgroundColor: "#041225" }}
                          color={colorScheme == "dark" ? "#fbfff1" : "#023c4d"}
                          label="+"
                          value="+"
                        />
                      </Picker>
                    </>
                  ) : (
                    <>
                      <DropDownPicker
                        open={gsOpen}
                        value={gsValue}
                        items={gsItems}
                        setOpen={setGSOpen}
                        setValue={setGSValue}
                        onChangeValue={(v) =>
                          setInfo({ ...info, gs: v as string })
                        }
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
                        setItems={setGSItems}
                      />
                      <DropDownPicker
                        open={rhOpen}
                        value={rhValue}
                        items={rhItems}
                        setOpen={setRhOpen}
                        setValue={setRhValue}
                        onChangeValue={(v) =>
                          setInfo({ ...info, rh: v as string })
                        }
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
                        setItems={setRhItems}
                      />
                    </>
                  )}
                </View>
              </View>
              <View className="w-1/2 flex flex-col">
                <Text className="text-center text-lg dark:text-ivory text-richer_black  mt-4 font-semibold">
                  {t("inputs.weight")}
                </Text>

                <TextInput
                  onChangeText={(w) =>
                    setInfo({
                      ...info,
                      weight: isNaN(parseInt(w)) ? 0 : parseInt(w),
                    })
                  }
                  value={info.weight == 0 ? "" : info.weight.toString()}
                  maxLength={3}
                  keyboardType="phone-pad"
                  placeholderTextColor={"#ffffff"}
                  className="flex justify-center align-middle text-center  m-auto h-12 py-2.5 text-xl mt-2 w-6/12   rounded-xl dark:bg-rich_black/80 bg-prussian_blue text-ivory border border-powder_blue/20 font-semibold"
                />
                <View className="justify-around flex flex-row">
                  <View className="flex justify-center">
                    <Text className="text-center w-24 text-lg dark:text-ivory text-richer_black  font-semibold">
                      {t("inputs.sex")}
                    </Text>
                    <View className="flex flex-row justify-center -mt-6">
                      {Platform.OS == "ios" ? (
                        <Picker
                          selectedValue={info.sex}
                          style={{ width: 100 }}
                          mode="dropdown"
                          onValueChange={(v) => setInfo({ ...info, sex: v })}
                        >
                          <Picker.Item
                            style={{ backgroundColor: "#041225" }}
                            color={
                              colorScheme == "dark" ? "#fbfff1" : "#023c4d"
                            }
                            label="M"
                            value="M"
                          />
                          <Picker.Item
                            style={{ backgroundColor: "#041225" }}
                            color={
                              colorScheme == "dark" ? "#fbfff1" : "#023c4d"
                            }
                            label="F"
                            value="F"
                          />
                          <Picker.Item
                            style={{ backgroundColor: "#041225" }}
                            color={
                              colorScheme == "dark" ? "#fbfff1" : "#023c4d"
                            }
                            label="IS"
                            value="IS"
                          />
                        </Picker>
                      ) : (
                        <DropDownPicker
                          open={sexOpen}
                          value={sexValue}
                          items={sexItems}
                          setOpen={setSexOpen}
                          setValue={setSexValue}
                          onChangeValue={(v) =>
                            setInfo({ ...info, sex: v as BirthSex })
                          }
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
                          setItems={setSexItems}
                        />
                      )}
                    </View>
                  </View>
                  {info.sex == BirthSex.FEMALE && (
                    <Animated.View
                      entering={FadeInLeft.duration(500)}
                      exiting={FadeOutLeft.duration(500)}
                      className="flex justify-center"
                    >
                      <Text className="text-center w-28 mr-2 text-lg dark:text-ivory text-richer_black   font-semibold">
                        {t("inputs.pregnant")}
                      </Text>
                      <View className="flex flex-row justify-center -mt-6">
                        {Platform.OS == "ios" ? (
                          <Picker
                            selectedValue={info.pregnant}
                            style={{ width: 100 }}
                            mode="dropdown"
                            onValueChange={(v) =>
                              setInfo({ ...info, pregnant: v })
                            }
                          >
                            <Picker.Item
                              color={
                                colorScheme == "dark" ? "#fbfff1" : "#023c4d"
                              }
                              style={{ backgroundColor: "#041225" }}
                              label={t("yes")}
                              value={true}
                            />
                            <Picker.Item
                              color={
                                colorScheme == "dark" ? "#fbfff1" : "#023c4d"
                              }
                              style={{ backgroundColor: "#041225" }}
                              label={t("no")}
                              value={false}
                            />
                          </Picker>
                        ) : (
                          <DropDownPicker
                            open={isPregnantOpen}
                            value={isPregnantValue}
                            items={isPregnantItems}
                            setOpen={setIsPregnantOpen}
                            setValue={setIsPregnantValue}
                            onChangeValue={(v) =>
                              setInfo({ ...info, pregnant: v as boolean })
                            }
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
                            setItems={setIsPregnantItems}
                          />
                        )}
                      </View>
                    </Animated.View>
                  )}
                </View>
              </View>
            </View>
          </Animated.View>
        ) : index == 4 ? (
          <Animated.View entering={FadeIn.duration(500)}>
            <Text className="text-center w-10/12 mx-auto text-lg mb-4 dark:text-ivory text-richer_black font-semibold">
              {t("inputs.trans")}
            </Text>
            <Slider
              options={[t("yes"), t("no")]}
              setOption={(v) => {
                setInfo({
                  ...info,
                  trans: v == t("yes"),
                  hormones: v == t("no") ? undefined : info.hormones,
                  surgery: v == t("no") ? undefined : info.surgery,
                });
              }}
              selected={
                info.trans
                  ? t("yes")
                  : info.trans != undefined
                    ? t("no")
                    : undefined
              }
            />
            {info.trans && (
              <Animated.View entering={FadeIn.duration(500)}>
                <Text className="text-center w-10/12 mx-auto text-lg my-4 dark:text-ivory text-richer_black font-semibold">
                  {t("inputs.hormones")}
                </Text>
                <Slider
                  options={[t("yes"), t("no")]}
                  setOption={(v) =>
                    setInfo({ ...info, hormones: v == t("yes") })
                  }
                  selected={
                    info.hormones
                      ? t("yes")
                      : info.hormones != undefined
                        ? t("no")
                        : undefined
                  }
                />
                <Text className="text-center w-10/12 mx-auto text-lg my-4 dark:text-ivory text-richer_black font-semibold">
                  {t("inputs.surgery")}
                </Text>
                <Slider
                  options={[t("yes"), t("no")]}
                  setOption={(v) =>
                    setInfo({ ...info, surgery: v == t("yes") })
                  }
                  selected={
                    info.surgery
                      ? t("yes")
                      : info.surgery != undefined
                        ? t("no")
                        : undefined
                  }
                />
              </Animated.View>
            )}
          </Animated.View>
        ) : index == 5 && info.trans ? (
          <Animated.View entering={FadeIn.duration(500)}>
            <Text className="text-center w-10/12 mx-auto text-lg mb-4 dark:text-ivory text-richer_black font-semibold">
              {t("inputs.altSex")}
            </Text>
            <View className="flex flex-row justify-center -mt-6">
              {Platform.OS == "ios" ? (
                <Picker
                  selectedValue={info.altSex}
                  style={{ width: 100 }}
                  onValueChange={(v) => setInfo({ ...info, altSex: v })}
                >
                  <Picker.Item
                    style={{ backgroundColor: "#041225" }}
                    color={colorScheme == "dark" ? "#fbfff1" : "#023c4d"}
                    label="M"
                    value={Sex.MALE}
                  />
                  <Picker.Item
                    color={colorScheme == "dark" ? "#fbfff1" : "#023c4d"}
                    label="F"
                    value={Sex.FEMALE}
                  />
                  <Picker.Item
                    color={colorScheme == "dark" ? "#fbfff1" : "#023c4d"}
                    label="NB"
                    value={Sex.NONBINARY}
                  />
                  <Picker.Item
                    color={colorScheme == "dark" ? "#fbfff1" : "#023c4d"}
                    label="O"
                    value={Sex.OTHER}
                  />
                </Picker>
              ) : (
                <DropDownPicker
                  open={altSexOpen}
                  value={altSexValue}
                  items={altSexItems}
                  setOpen={setAltSexOpen}
                  setValue={setAltSexValue}
                  onChangeValue={(v) => setInfo({ ...info, altSex: v as Sex })}
                  theme="DARK"
                  textStyle={{ color: "#fbfff1" }}
                  style={{ backgroundColor: "#041225" }}
                  badgeColors={"#fbfff1"}
                  labelStyle={{ textAlign: "center" }}
                  containerStyle={{ width: 80, marginTop: 32 }}
                  listParentContainerStyle={{ height: 36 }}
                  listItemContainerStyle={{ backgroundColor: "#041225" }}
                  setItems={setAltSexItems}
                />
              )}
            </View>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.duration(500)}>
            <Text className="text-center text-lg dark:text-ivory text-richer_black  mt-4 font-semibold">
              {t("inputs.password")}
            </Text>
            <TextInput
              onChangeText={(pw) => setInfo({ ...info, password: pw })}
              value={info.password}
              passwordRules="required: upper; required: lower; required: digit; max-consecutive: 2; minlength: 8;"
              secureTextEntry
              keyboardType="default"
              placeholderTextColor={"#ffffff"}
              className="flex justify-center align-middle  m-auto h-12 p-1 py-2.5 pl-3 text-xl w-10/12   rounded-xl dark:bg-rich_black/80 bg-prussian_blue text-ivory border border-powder_blue/20 font-semibold"
            />
            <Text className="text-center text-lg dark:text-ivory text-richer_black  mt-4 font-semibold">
              {t("inputs.passwordChk")}
            </Text>
            <TextInput
              onChangeText={(pw) => setInfo({ ...info, passwordchk: pw })}
              value={info.passwordchk}
              passwordRules="required: upper; required: lower; required: digit; max-consecutive: 2; minlength: 8;"
              secureTextEntry
              keyboardType="default"
              placeholderTextColor={"#ffffff"}
              className="flex justify-center align-middle  m-auto h-12 p-1 py-2.5 pl-3 text-xl w-10/12   rounded-xl dark:bg-rich_black/80 bg-prussian_blue text-ivory border border-powder_blue/20 font-semibold"
            />
          </Animated.View>
        )
      ) : index == 3 ? (
        <Animated.View
          className="flex flex-col"
          entering={FadeIn.duration(500)}
        >
          <Text className="text-center text-lg dark:text-ivory text-richer_black -mb-3 mt-4 font-semibold">
            {t("inputs.first")}
          </Text>
          <TextInput
            onChangeText={(n) =>
              setInfo({
                ...info,
                firstName: n,
              })
            }
            value={info.firstName}
            keyboardType="default"
            placeholderTextColor={"#ffffff"}
            className="flex justify-center align-middle  m-auto h-12 p-1 py-2.5 pl-3 text-xl mt-3 w-10/12   rounded-xl dark:bg-rich_black/80 bg-prussian_blue text-ivory border border-powder_blue/20 font-semibold"
          />
          <Text className="text-center text-lg dark:text-ivory text-richer_black -mb-3 mt-4 font-semibold">
            {t("inputs.last")}
          </Text>
          <TextInput
            onChangeText={(n) =>
              setInfo({
                ...info,
                lastName: n,
              })
            }
            value={info.lastName}
            keyboardType="default"
            placeholderTextColor={"#ffffff"}
            className="flex justify-center align-middle  m-auto h-12 p-1 py-2.5 pl-3 text-xl mt-3 w-10/12   rounded-xl dark:bg-rich_black/80 bg-prussian_blue text-ivory border border-powder_blue/20 font-semibold"
          />
          {/* <Text className="text-center w-10/12 mx-auto text-lg mt-4 dark:text-ivory text-richer_black font-semibold">
            What is your specialty?
          </Text>
          <View className="flex flex-row justify-center">
            {Platform.OS !== "ios" ? (
              <Picker
                selectedValue={info.specialty}
                style={{
                  width: (Dimensions.get("window").width * 11) / 12,
                  marginTop: -40,
                }}
                onValueChange={(v) => setInfo({ ...info, specialty: v })}
              >
                {Object.values(Specialty).map((v, i) => (
                  <Picker.Item color={colorScheme == 'dark' ? "#fbfff1" : "#023c4d"} key={i} label={v} value={v} />
                ))}
              </Picker>
            ) : (
              <DropDownPicker
                open={specialtyOpen}
                value={specialtyValue}
                items={specialtyItems}
                setOpen={setSpecialtyOpen}
                setValue={setSpecialtyValue}
                onChangeValue={(v) =>
                  setInfo({ ...info, specialty: v as Specialty })
                }
                theme="DARK"
                textStyle={{ color: "#fbfff1" }}
                style={{ backgroundColor: "#041225" }}
                badgeColors={"#fbfff1"}
                labelStyle={{ textAlign: "center" }}
                dropDownContainerStyle={{ height: 120 }}
                containerStyle={{
                  width: (Dimensions.get("window").width * 11) / 12,
                }}
                listParentContainerStyle={{ height: 40 }}
                listItemContainerStyle={{ backgroundColor: "#041225" }}
                setItems={setSpecialtyItems}
              />
            )}
          </View> */}
        </Animated.View>
      ) : index == 4 ? (
        <Animated.View
          className="flex flex-col w-full"
          entering={FadeIn.duration(500)}
        >
          <Text className="text-center text-lg dark:text-ivory text-richer_black -mb-3 mt-4 font-semibold">
            {t("inputs.experience")}
          </Text>
          <TextInput
            onChangeText={(n) =>
              setInfo({
                ...info,
                experience: n,
              })
            }
            value={info.experience}
            keyboardType="default"
            placeholderTextColor={"#ffffff"}
            className="flex justify-center align-middle  m-auto h-12 p-1 py-2.5 pl-3 text-xl mt-3 w-10/12   rounded-xl dark:bg-rich_black/80 bg-prussian_blue text-ivory border border-powder_blue/20 font-semibold"
          />
          <Text className="text-center flex text-lg dark:text-ivory text-richer_black -mb-3 mt-4 font-semibold">
            {t("inputs.bio")} ({info.about.length}/300)
          </Text>
          <TextInput
            onChangeText={(n) =>
              setInfo({
                ...info,
                about: n,
              })
            }
            maxLength={300}
            multiline
            value={info.about}
            keyboardType="default"
            placeholderTextColor={"#ffffff"}
            className="flex justify-center align-middle  m-auto h-52 p-1 py-2.5 pl-3 text-lg mt-3 w-10/12   rounded-xl dark:bg-rich_black/80 bg-prussian_blue text-ivory border border-powder_blue/20 font-semibold"
          />
        </Animated.View>
      ) : index == 5 ? (
        <Animated.View
          className="flex flex-col w-full"
          entering={FadeIn.duration(500)}
        >
          <Text className="text-center text-lg dark:text-ivory text-richer_black  font-semibold">
            {t("inputs.license")}
          </Text>
          {/* <TouchableOpacity
            className="mx-auto px-8 dark:bg-midnight_green bg-prussian_blue flex py-1 rounded-xl mt-4 "
            onPress={() =>
              hasPermission
                ? setCameraOpen(true)
                : Alert.alert(
                    "Error",
                    "Allow the camera in settings to take a photo!",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Settings",
                        style: "default",
                        onPress: () => Linking.openSettings(),
                      },
                    ],
                  )
            }
          >
            <Text className="text-lg text-center w-full my-auto dark:text-ivory text-richer_black font-semibold">
              Take Photo
            </Text>
          </TouchableOpacity> */}
          <Animated.ScrollView
            centerContent
            horizontal
            entering={FadeIn.duration(500)}
            // exiting={FadeOut.duration(0)}
            contentContainerStyle={{ justifyContent: "space-between" }}
            style={{ width: Dimensions.get("window").width }}
            className="flex flex-row h-fit m-auto py-4"
          >
            {info.license.map((v, i) => (
              <ImageUpload
                activeDelete={v == activeDelete}
                setActiveDelete={setActiveDelete}
                key={i}
                image={v}
                removeImage={removeImage}
              />
            ))}
            <TouchableOpacity
              onPress={() =>
                Alert.alert(t("images.choose"), undefined, [
                  {
                    text: t("images.gallery"),
                    onPress: async () => {
                      const i = await selectImage("gallery");
                      if (i)
                        setInfo({ ...info, license: [...info.license, i] });
                    },
                  },
                  {
                    text: t("images.camera"),
                    onPress: async () => {
                      const i = await selectImage("camera");
                      if (i)
                        setInfo({ ...info, license: [...info.license, i] });
                    },
                  },
                  { text: t("buttons.cancel"), style: "cancel" },
                ])
              }
              className=" w-64 h-64 mx-2  aspect-square flex border-dashed border dark:border-ivory/80 border-midnight_green rounded-xl"
            >
              <View className="m-auto">
                <Icons
                  name="plus-circle"
                  color={colorScheme == "dark" ? "#fbfff1" : "#023c4d"}
                  size={50}
                />
              </View>
            </TouchableOpacity>
          </Animated.ScrollView>
        </Animated.View>
      ) : index == 6 ? (
        <Animated.View entering={FadeIn.duration(500)}>
          <Text className="text-center text-lg dark:text-ivory text-richer_black mb-3  font-semibold">
            {t("inputs.picture")}
          </Text>
          {info.picture.length == 0 ? (
            <TouchableOpacity
              onPress={() =>
                Alert.alert(t("images.choose"), undefined, [
                  {
                    text: t("images.gallery"),
                    onPress: async () =>
                      setInfo({
                        ...info,
                        picture: (await selectImage("gallery")) ?? info.picture,
                      }),
                  },
                  {
                    text: t("images.camera"),
                    onPress: async () =>
                      setInfo({
                        ...info,
                        picture: (await selectImage("camera")) ?? info.picture,
                      }),
                  },
                  { text: t("buttons.cancel"), style: "cancel" },
                ])
              }
              className=" w-64 h-64 mx-auto  aspect-square flex border-dashed border dark:border-ivory/80 border-midnight_green rounded-xl"
            >
              <View className="m-auto">
                <Icons
                  name="plus-circle"
                  color={colorScheme == "dark" ? "#fbfff1" : "#023c4d"}
                  size={50}
                />
              </View>
            </TouchableOpacity>
          ) : (
            <Animated.View
              // exiting={FadeOut.duration(500)}
              entering={FadeInUp.duration(500)}
              className="w-64 h-64 mx-auto relative z-50 flex aspect-square border border-solid border-ivory/80 rounded-xl"
            >
              <Image
                source={info.picture}
                className=" aspect-square w-64 h-64 rounded-xl"
              />
              <Pressable
                onPress={() => setActiveChange(!activeChange)}
                className="absolute rounded-xl w-64 h-64  z-50  flex"
              >
                {activeChange && (
                  <Animated.View
                    entering={FadeIn.duration(250)}
                    exiting={FadeOut.duration(250)}
                    className="h-full rounded-xl w-full bg-ivory/50"
                  >
                    <TouchableOpacity
                      onPress={() =>
                        Alert.alert(t("images.choose"), undefined, [
                          {
                            text: t("images.gallery"),
                            onPress: async () =>
                              setInfo({
                                ...info,
                                picture:
                                  (await selectImage("gallery")) ??
                                  info.picture,
                              }),
                          },
                          {
                            text: t("images.camera"),
                            onPress: async () =>
                              setInfo({
                                ...info,
                                picture:
                                  (await selectImage("camera")) ?? info.picture,
                              }),
                          },
                          { text: t("buttons.cancel"), style: "cancel" },
                        ])
                      }
                      className="m-auto p-4"
                    >
                      <Icons name="pencil" size={60} color={"#08254099"} />
                    </TouchableOpacity>
                  </Animated.View>
                )}
              </Pressable>
            </Animated.View>
          )}
        </Animated.View>
      ) : (
        <Animated.View entering={FadeIn.duration(500)}>
          <Text className="text-center text-lg dark:text-ivory text-richer_black  mt-4 font-semibold">
            {t("inputs.password")}
          </Text>
          <TextInput
            onChangeText={(pw) => setInfo({ ...info, password: pw })}
            value={info.password}
            passwordRules="required: upper; required: lower; required: digit; max-consecutive: 2; minlength: 8;"
            secureTextEntry
            keyboardType="default"
            placeholderTextColor={"#ffffff"}
            className="flex justify-center align-middle  m-auto h-12 p-1 py-2.5 pl-3 text-xl  w-10/12   rounded-xl dark:bg-rich_black/80 bg-prussian_blue text-ivory border border-powder_blue/20 font-semibold"
          />
          <Text className="text-center text-lg dark:text-ivory text-richer_black  mt-4 font-semibold">
            {t("inputs.passwordChk")}
          </Text>
          <TextInput
            onChangeText={(pw) => setInfo({ ...info, passwordchk: pw })}
            value={info.passwordchk}
            passwordRules="required: upper; required: lower; required: digit; max-consecutive: 2; minlength: 8;"
            secureTextEntry
            keyboardType="default"
            placeholderTextColor={"#ffffff"}
            className="flex justify-center align-middle  m-auto h-12 p-1 py-2.5 pl-3 text-xl  w-10/12   rounded-xl dark:bg-rich_black/80 bg-prussian_blue text-ivory border border-powder_blue/20 font-semibold"
          />
        </Animated.View>
      )}
      <CountryPicker
        show={show}
        // when picker button press you will get the country object with dial code
        pickerButtonOnPress={(item: { flag: any; dial_code: any }) => {
          setCountryCode(item.flag + item.dial_code);
          setInfo({ ...info, countryCode: item.dial_code });
          setShow(!show);
        }}
        enableModalAvoiding
        // androidWindowSoftInputMode={"pan"}
        onBackdropPress={() => setShow(!show)}
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
      {/* <LoadingScreen text="Loading" show={loading} /> */}
    </View>
  );
}
