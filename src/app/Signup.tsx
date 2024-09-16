import {
  Alert,
  Dimensions,
  Keyboard,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Icons from "@expo/vector-icons/Octicons";
import CryptoJS from "crypto-es";
import {
  BirthSex,
  Sex,
  SignupInfo,
  SignupProps,
  UserType,
} from "../components/utils/Types";
import React, { createRef, useEffect, useState } from "react";
import { CountryPicker } from "react-native-country-codes-picker";
import {
  callAPI,
  isDoctorSignupInfo,
  isPatientSignupInfo,
} from "../components/utils/Functions";
import Spinner from "react-native-loading-spinner-overlay";
import Loader from "components/misc/Loader";
import { STATUS_CODES } from "@/backend/models/util";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { Picker, PickerIOS } from "@react-native-picker/picker";
import Slider from "components/buttons/Slider";
import Animated, {
  FadeIn,
  FadeInLeft,
  FadeInUp,
  FadeOut,
  FadeOutDown,
  FadeOutLeft,
  SlideInLeft,
  SlideOutDown,
  SlideOutRight,
  ZoomOut,
} from "react-native-reanimated";
import * as ImagePicker from 'expo-image-picker';
import { Camera, CameraView, PermissionStatus } from "expo-camera";
import * as Linking from "expo-linking";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { rgbaColor } from "react-native-reanimated/lib/typescript/reanimated2/Colors";
import {
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import DropDownPicker from "react-native-dropdown-picker";
import prompt from "@powerdesigninc/react-native-prompt";
import { Specialty } from "@/backend/models/specialty";
import ImageUpload from "components/misc/ImageUpload";


export default function Signup({
  info,
  index,
  userType,
  setInfo,
  setIndex,
  cameraOpen,
  setCameraOpen,
}: SignupProps) {
  /// setInfo({...info, info.(PROPIEDAD Q QUIERES CAMBIAR)})
  const [show, setShow] = useState(false);
  const [status, requestPermission] = ImagePicker.useCameraPermissions();
  const cameraRef = createRef<CameraView>();
  const [countryCode, setCountryCode] = useState("🇨🇴+57");
  const [loading, setIsLoading] = useState(false);
  const [ready, setisReady] = useState(false);
  const [gsValue, setGSValue] = useState("O");
  const [gsOpen, setGSOpen] = useState(false);
  const [verified, setIsVerified] = useState(false);
  const [activeDelete, setActiveDelete] = useState("");
  const [gsItems, setGSItems] = useState([
    { label: "O", value: "O" },
    { label: "A", value: "A" },
    { label: "B", value: "B" },
    { label: "AB", value: "AB" },
  ]);
  const [rhValue, setRhValue] = useState("+");
  const [rhOpen, setRhOpen] = useState(false);
  const [rhItems, setRhItems] = useState([
    { label: "+", value: "+" },
    { label: "-", value: "-" },
  ]);

  // Sex States
  const [sexValue, setSexValue] = useState("M");
  const [sexOpen, setSexOpen] = useState(false);
  const [sexItems, setSexItems] = useState([
    { label: "M", value: "M" },
    { label: "F", value: "F" },
    { label: "IS", value: "IS" },
  ]);

  const [altSexValue, setAltSexValue] = useState("M");
  const [altSexOpen, setAltSexOpen] = useState(false);
  const [altSexItems, setAltSexItems] = useState([
    { label: "M", value: "M" },
    { label: "F", value: "F" },
    { label: "NB", value: "NB" },
    { label: "O", value: "O" },
  ]);

  // Pregnancy Status States
  const [isPregnantValue, setIsPregnantValue] = useState(false);
  const [isPregnantOpen, setIsPregnantOpen] = useState(false);
  const [isPregnantItems, setIsPregnantItems] = useState([
    { label: "Yes", value: true },
    { label: "No", value: false },
  ]);

  const [specialtyValue, setSpecialtyValue] = useState(
    Specialty.GeneralPractitioner,
  ); // Default value
  const [specialtyOpen, setSpecialtyOpen] = useState(false);
  const [specialtyItems, setSpecialtyItems] = useState(
    Object.values(Specialty).map((s) => ({ label: s, value: s })),
  );

  useEffect(() => {
    console.log(index);
    const doChecks = async () => {
      if (index == 3) {
        setIsLoading(true);
        const res = await callAPI(`/users/check`, "POST", {
          number: info.countryCode + info.number,
          id: info.identification,
        });
        console.log(info.countryCode + info.number);
        if (
          res.status == STATUS_CODES.ID_IN_USE ||
          res.status == STATUS_CODES.NUMBER_IN_USE
        ) {
          setIndex(index - 1);
          setIsLoading(false);
          return Alert.alert("Error", "That number/ID already exists!");
        }
        if (!verified) {
          const isValid =
            /^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/.test(
              info.number,
            );
          if (!isValid) {
            setIndex(index - 1);
            setIsLoading(false);
            return Alert.alert("Error", "That is not a valid phone number");
          }
          // const verify = await callAPI("/verify/code/send", "POST", {
          //   number: info.countryCode + info.number,
          // });
          // if (verify.status === STATUS_CODES.INVALID_NUMBER)
          //  { setIndex(index-1);
          //   setIsLoading(false);return Alert.alert("Error", "That number is invalid!");}
          // else if (verify.status === STATUS_CODES.NUMBER_NOT_EXIST)
          //  { setIndex(index-1);
          //   setIsLoading(false);return Alert.alert("Error", "That number does not exist!");}
          // else if (verify.status === STATUS_CODES.ERROR_SENDING_CODE)
          // {  setIndex(index-1);
          //   setIsLoading(false);return Alert.alert("Error", "There was an error sending the code!");}
          // else {
          //   setTimeout(() => {
          //     return prompt(
          //       "Enter Verification Code",
          //       "Enter the verification code sent to: " +
          //         (info.countryCode + info.number),
          //       [{text: 'Cancel', style: 'cancel', onPress: () => {setIndex(index-1);
          //         setIsLoading(false)}}, {text: 'Check', isPreferred: true, onPress: async (input) => {
          //         setIsLoading(true);
          //         const v = await callAPI("/verify/code/check", "POST", {
          //           number: info.countryCode + info.number,
          //           input,
          //         });
          //         if (v.status !== STATUS_CODES.SUCCESS) {
          //           setIsLoading(false);
          //           return Alert.alert("Error", "The code is incorrect!");
          //         }
          //         setIsVerified(true);
          //       }}],
          //       "plain-text",
          //       "",
          //       "number-pad",
          //     );
          //   }, 250);
          // }
        }
        setIsLoading(false);
      } else if (index == 4) {
        if (userType != UserType.PATIENT) {
          (async () => {
            // const { status } = await Camera.requestCameraPermissionsAsync();
            const { status } = await requestPermission();

            setHasPermission(status === "granted");
          })();
        }
      }
    };
    doChecks();
  }, [index]);
  const photo = () => {
    if (ready && isDoctorSignupInfo(userType, info))
      cameraRef.current?.takePictureAsync({ quality: 1 }).then((photo: any) => {
        //https://github.com/gennadysx/react-native-document-scanner-plugin#readme
        setInfo({ ...info, license: [...info.license, photo.uri] });
        setCameraOpen(false);
        // FileSystem.readAsStringAsync(photo.uri, { encoding: "base64" }).then(
        //   (res) => {
        //     setInfo({ ...info, license: [...info.license, res] });
        //     // console.log((res.length / 1000).toFixed(2) + "KB")
        //     setCameraOpen(false);
        //   },
        // );
      });
  };
  const removeImage = (image: string) =>
    isDoctorSignupInfo(userType, info) &&
    setInfo({ ...info, license: info.license.filter((v) => v !== image) });
  return (
    <View className="h-full ">
      <Animated.Text
        entering={FadeIn.duration(500)}
        key={index}
        className="text-5xl text-ivory font-bold text-center mb-6"
      >
        {index == 2 ? "Register" : "Personal Information"}
      </Animated.Text>
      {index == 2 ? (
        <Animated.View entering={FadeIn.duration(500)}>
          {/* needs to show a text box to input a phone number and identificatio number */}
          <Text className="text-center text-lg text-ivory -mb-3 font-semibold">
            Phone Number
          </Text>
          <View className="flex flex-row justify-center m-auto align-middle  ">
            <TouchableOpacity
              onPress={() => setShow(!show)}
              className=" bg-rich_black border border-powder_blue/20 border-r-0 text-center align-middle p-1 h-12 mt-3 w-3/12 rounded-l-xl"
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
              className="flex justify-center align-middle  my-auto ml-0 h-12 p-1 py-2.5 pl-3 text-xl mt-3 w-7/12   rounded-xl rounded-l-none bg-rich_black text-ivory border border-powder_blue/20 font-semibold"
            />
          </View>
          <Text className="text-center text-lg text-ivory -mb-3 mt-4 font-semibold">
            {userType == UserType.DOCTOR ? "Cedula" : "Cedula/TI"}
          </Text>
          <TextInput
            onChangeText={(id) =>
              setInfo({
                ...info,
                identification: isNaN(parseInt(id)) ? 0 : parseInt(id),
              })
            }
            value={
              info.identification == 0 ? "" : info.identification.toString()
            }
            keyboardType="phone-pad"
            placeholderTextColor={"#ffffff"}
            className="flex justify-center align-middle  m-auto h-12 p-1 py-2.5 pl-3 text-xl mt-3 w-10/12   rounded-xl bg-rich_black text-ivory border border-powder_blue/20 font-semibold"
          />
        </Animated.View>
      ) : isPatientSignupInfo(userType, info) ? (
        index == 3 ? (
          <Animated.View
            entering={FadeIn.duration(500)}
            className={"h-full flex flex-col"}
          >
            <Text className="text-center text-lg text-ivory mb-2 mt-0 font-semibold">
              Date of Birth
            </Text>
            <View className="flex w-full justify-center">
              {Platform.OS == "ios" ? (
                <DateTimePicker
                  value={new Date(info.dob ?? new Date())}
                  maximumDate={new Date()}
                  onChange={(d) => {
                    setInfo({ ...info, dob: d.nativeEvent.timestamp });
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
                  <Text className="text-ivory text-lg">
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
                <Text className="text-center text-lg text-ivory  mt-4 font-semibold">
                  Height (cm)
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
                  className="flex justify-center align-middle text-center  m-auto h-12 py-2.5 text-xl mt-2 w-6/12   rounded-xl bg-rich_black text-ivory border border-powder_blue/20 font-semibold"
                />
                <Text className="text-center text-lg text-ivory  mt-4 font-semibold">
                  Blood Type
                </Text>
                <View className="flex flex-row justify-center mx-auto -mt-6">
                  {Platform.OS == "ios" ? (
                    <>
                      <Picker
                        className="h-12 text-ivory flex justify-center text-center mx-auto rounded-lg"
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
                          color="#fbfff1"
                          label="O"
                          value="O"
                        />
                        <Picker.Item
                          style={{ backgroundColor: "#041225" }}
                          color="#fbfff1"
                          label="A"
                          value="A"
                        />
                        <Picker.Item
                          style={{ backgroundColor: "#041225" }}
                          color="#fbfff1"
                          label="B"
                          value="B"
                        />
                        <Picker.Item
                          style={{ backgroundColor: "#041225" }}
                          color="#fbfff1"
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
                          color="#fbfff1"
                          label="-"
                          value="-"
                        />
                        <Picker.Item
                          style={{ backgroundColor: "#041225" }}
                          color="#fbfff1"
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
                        listItemContainerStyle={{ backgroundColor: "#041225" }}
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
                        listItemContainerStyle={{ backgroundColor: "#041225" }}
                        setItems={setRhItems}
                      />
                    </>
                  )}
                </View>
              </View>
              <View className="w-1/2 flex flex-col">
                <Text className="text-center text-lg text-ivory  mt-4 font-semibold">
                  Weight (kg)
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
                  className="flex justify-center align-middle text-center  m-auto h-12 py-2.5 text-xl mt-2 w-6/12   rounded-xl bg-rich_black text-ivory border border-powder_blue/20 font-semibold"
                />
                <View className="justify-around flex flex-row">
                  <View className="flex justify-center">
                    <Text className="text-center w-24 text-lg text-ivory  font-semibold">
                      Sex
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
                            color="#fbfff1"
                            label="M"
                            value="M"
                          />
                          <Picker.Item
                            style={{ backgroundColor: "#041225" }}
                            color="#fbfff1"
                            label="F"
                            value="F"
                          />
                          <Picker.Item
                            style={{ backgroundColor: "#041225" }}
                            color="#fbfff1"
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
                      <Text className="text-center w-24 text-lg text-ivory   font-semibold">
                        Pregnant
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
                              color="#fbfff1"
                              style={{ backgroundColor: "#041225" }}
                              label="Yes"
                              value={true}
                            />
                            <Picker.Item
                              color="#fbfff1"
                              style={{ backgroundColor: "#041225" }}
                              label="No"
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
            <Text className="text-center w-10/12 mx-auto text-lg mb-4 text-ivory font-semibold">
              Do you identify as a different sex than your birth sex?
            </Text>
            <Slider
              options={["Yes", "No"]}
              setOption={(v) => {
                setInfo({
                  ...info,
                  trans: v == "Yes",
                  hormones: v == "No" ? undefined : info.hormones,
                  surgery: v == "No" ? undefined : info.surgery,
                });
              }}
              selected={
                info.trans ? "Yes" : info.trans != undefined ? "No" : undefined
              }
            />
            {info.trans && (
              <Animated.View entering={FadeIn.duration(500)}>
                <Text className="text-center w-10/12 mx-auto text-lg my-4 text-ivory font-semibold">
                  Do you take hormones?
                </Text>
                <Slider
                  options={["Yes", "No"]}
                  setOption={(v) => setInfo({ ...info, hormones: v == "Yes" })}
                  selected={
                    info.hormones
                      ? "Yes"
                      : info.hormones != undefined
                        ? "No"
                        : undefined
                  }
                />
                <Text className="text-center w-10/12 mx-auto text-lg my-4 text-ivory font-semibold">
                  Have you had a sex-changing surgery?
                </Text>
                <Slider
                  options={["Yes", "No"]}
                  setOption={(v) => setInfo({ ...info, surgery: v == "Yes" })}
                  selected={
                    info.surgery
                      ? "Yes"
                      : info.surgery != undefined
                        ? "No"
                        : undefined
                  }
                />
              </Animated.View>
            )}
          </Animated.View>
        ) : index == 5 && info.trans ? (
          <Animated.View entering={FadeIn.duration(500)}>
            <Text className="text-center w-10/12 mx-auto text-lg mb-4 text-ivory font-semibold">
              What sex do you identify with?
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
                    color="#fbfff1"
                    label="M"
                    value={Sex.MALE}
                  />
                  <Picker.Item color="#fbfff1" label="F" value={Sex.FEMALE} />
                  <Picker.Item
                    color="#fbfff1"
                    label="NB"
                    value={Sex.NONBINARY}
                  />
                  <Picker.Item color="#fbfff1" label="O" value={Sex.OTHER} />
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
            <Text className="text-center text-lg text-ivory  mt-4 font-semibold">
              Password
            </Text>
            <TextInput
              onChangeText={(pw) => setInfo({ ...info, password: pw })}
              value={info.password}
              passwordRules="required: upper; required: lower; required: digit; max-consecutive: 2; minlength: 8;"
              secureTextEntry
              keyboardType="default"
              placeholderTextColor={"#ffffff"}
              className="flex justify-center align-middle  m-auto h-12 p-1 py-2.5 pl-3 text-xl mt-3 w-10/12   rounded-xl bg-rich_black text-ivory border border-powder_blue/20 font-semibold"
            />
            <Text className="text-center text-lg text-ivory  mt-4 font-semibold">
              Re-enter Password
            </Text>
            <TextInput
              onChangeText={(pw) => setInfo({ ...info, passwordchk: pw })}
              value={info.passwordchk}
              passwordRules="required: upper; required: lower; required: digit; max-consecutive: 2; minlength: 8;"
              secureTextEntry
              keyboardType="default"
              placeholderTextColor={"#ffffff"}
              className="flex justify-center align-middle  m-auto h-12 p-1 py-2.5 pl-3 text-xl mt-3 w-10/12   rounded-xl bg-rich_black text-ivory border border-powder_blue/20 font-semibold"
            />
          </Animated.View>
        )
      ) : index == 3 ? (
        <Animated.View
          className="flex flex-col"
          entering={FadeIn.duration(500)}
        >
          <TouchableOpacity
              onPress={() => setCameraOpen(true)}
              className=" w-48 h-48 mx-auto  aspect-square flex border-dashed border border-ivory/80 rounded-xl"
            >
              <View className="m-auto">
                <Icons name="plus-circle" color={"#fbfff1"} size={50} />
              </View>
            </TouchableOpacity>
          <Text className="text-center text-lg text-ivory -mb-3 mt-4 font-semibold">
            First Names
          </Text>
          <TextInput
            onChangeText={(n) =>
              setInfo({
                ...info,
                firstNames: n,
              })
            }
            value={info.firstNames}
            keyboardType="default"
            placeholderTextColor={"#ffffff"}
            className="flex justify-center align-middle  m-auto h-12 p-1 py-2.5 pl-3 text-xl mt-3 w-10/12   rounded-xl bg-rich_black text-ivory border border-powder_blue/20 font-semibold"
          />
          <Text className="text-center text-lg text-ivory -mb-3 mt-4 font-semibold">
            Last Names
          </Text>
          <TextInput
            onChangeText={(n) =>
              setInfo({
                ...info,
                lastNames: n,
              })
            }
            value={info.lastNames}
            keyboardType="default"
            placeholderTextColor={"#ffffff"}
            className="flex justify-center align-middle  m-auto h-12 p-1 py-2.5 pl-3 text-xl mt-3 w-10/12   rounded-xl bg-rich_black text-ivory border border-powder_blue/20 font-semibold"
          />
          {/* <Text className="text-center w-10/12 mx-auto text-lg mt-4 text-ivory font-semibold">
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
                  <Picker.Item color="#fbfff1" key={i} label={v} value={v} />
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
          <Text className="text-center text-lg text-ivory  font-semibold">
            Upload your doctor's license or degree
          </Text>
          {cameraOpen && hasPermission && (
            <CameraView
              className={
                "w-screen aspect-square absolute z-40 "
                // + (Platform.OS == "ios" ? "-top-[336px]" : "-top-[260px]")
              }
              ref={cameraRef}
              onCameraReady={() => setisReady(true)}
            >
              <TouchableOpacity
                className="absolute left-1/2 -translate-x-12 -bottom-28"
                onPress={() => photo()}
              >
                <Ionicons name="ellipse-outline" size={98} color={"#fbfff1"} />
                {/* <Icon name="circle" size={72} color={'#ffffff'} /> */}
              </TouchableOpacity>
            </CameraView>
          )}
          {/* <TouchableOpacity
            className="mx-auto px-8 bg-midnight_green flex py-1 rounded-xl mt-4 "
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
            <Text className="text-lg text-center w-full my-auto text-ivory font-semibold">
              Take Photo
            </Text>
          </TouchableOpacity> */}
          <Animated.ScrollView
            horizontal
            entering={FadeIn.duration(500)}
            // exiting={FadeOut.duration(0)}
            contentContainerStyle={{ justifyContent: "space-between" }}
            style={{ width: Dimensions.get("window").width }}
            className="flex flex-row h-fit m-auto p-4"
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
              onPress={() => setCameraOpen(true)}
              className=" w-64 h-64 mx-2  aspect-square flex border-dashed border border-ivory/80 rounded-xl"
            >
              <View className="m-auto">
                <Icons name="plus-circle" color={"#fbfff1"} size={50} />
              </View>
            </TouchableOpacity>
          </Animated.ScrollView>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeIn.duration(500)}>
          <Text className="text-center text-lg text-ivory  mt-4 font-semibold">
            Password
          </Text>
          <TextInput
            onChangeText={(pw) => setInfo({ ...info, password: pw })}
            value={info.password}
            passwordRules="required: upper; required: lower; required: digit; max-consecutive: 2; minlength: 8;"
            secureTextEntry
            keyboardType="default"
            placeholderTextColor={"#ffffff"}
            className="flex justify-center align-middle  m-auto h-12 p-1 py-2.5 pl-3 text-xl mt-3 w-10/12   rounded-xl bg-rich_black text-ivory border border-powder_blue/20 font-semibold"
          />
          <Text className="text-center text-lg text-ivory  mt-4 font-semibold">
            Re-enter Password
          </Text>
          <TextInput
            onChangeText={(pw) => setInfo({ ...info, passwordchk: pw })}
            value={info.passwordchk}
            passwordRules="required: upper; required: lower; required: digit; max-consecutive: 2; minlength: 8;"
            secureTextEntry
            keyboardType="default"
            placeholderTextColor={"#ffffff"}
            className="flex justify-center align-middle  m-auto h-12 p-1 py-2.5 pl-3 text-xl mt-3 w-10/12   rounded-xl bg-rich_black text-ivory border border-powder_blue/20 font-semibold"
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
      <Spinner
        visible={loading}
        overlayColor="#00000099"
        textContent={"Loading"}
        customIndicator={<Loader />}
        textStyle={{ color: "#fff", marginTop: -25 }}
        animation="fade"
      />
    </View>
  );
}
