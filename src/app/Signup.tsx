import {
  Alert,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  BirthSex,
  SignupInfo,
  SignupProps,
  UserType,
} from "../components/utils/Types";
import React, { useEffect, useState } from "react";
import { CountryPicker } from "react-native-country-codes-picker";
import { callAPI, isPatientInfo } from "../components/utils/Functions";
import Spinner from "react-native-loading-spinner-overlay";
import Loader from "components/misc/Loader";
import { STATUS_CODES } from "@/backend/models/util";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker, PickerIOS } from "@react-native-picker/picker";
import Slider from "components/buttons/Slider";
import Animated, {
  FadeIn,
  FadeInLeft,
  FadeOut,
  FadeOutLeft,
} from "react-native-reanimated";

export default function Signup({
  info,
  index,
  userType,
  setInfo,
  setIsLogged,
}: SignupProps) {
  /// setInfo({...info, info.(PROPIEDAD Q QUIERES CAMBIAR)})
  const [show, setShow] = useState(false);
  const [countryCode, setCountryCode] = useState("🇨🇴+57");
  const [loading, setIsLoading] = useState(false);

  useEffect(() => {
    const doChecks = async () => {
      if (index == 3) {
        // check if number and id dont exist
        // setIsLoading(true);
        // const res = await callAPI("/users/check", "POST", {number: info.number, identification: info.identification});
        // if (res.status != STATUS_CODES.SUCCESS) {
        //   setIsLoading(false);
        //   setIndex(index-1);
        //   Alert.alert("Error", "That number/ID already exists!");
        // }
      }
    };
    doChecks();
  }, [index]);
  return (
    <View className="h-full ">
      <Animated.Text
        entering={FadeIn.duration(500)}
        key={index}
        className="text-5xl text-ivory font-bold text-center mb-8"
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
              onChangeText={(n) => setInfo({ ...info, number: n })}
              value={info.number}
              keyboardType="phone-pad"
              placeholderTextColor={"#ffffff"}
              className="flex justify-center align-middle  my-auto ml-0 h-12 p-1 py-2.5 pl-3 text-xl mt-3 w-7/12   rounded-xl rounded-l-none bg-rich_black text-ivory border border-powder_blue/20 font-semibold"
            />
          </View>
          <Text className="text-center text-lg text-ivory -mb-3 mt-4 font-semibold">
            Cedula/TI
          </Text>
          <TextInput
            onChangeText={(id) => setInfo({ ...info, identification: id })}
            value={info.identification}
            keyboardType="phone-pad"
            placeholderTextColor={"#ffffff"}
            className="flex justify-center align-middle  m-auto h-12 p-1 py-2.5 pl-3 text-xl mt-3 w-10/12   rounded-xl bg-rich_black text-ivory border border-powder_blue/20 font-semibold"
          />
        </Animated.View>
      ) : isPatientInfo(userType, info) ? (
        index == 3 ? (
          <Animated.View
            entering={FadeIn.duration(500)}
            className={"h-full flex flex-col"}
          >
            <Text className="text-center text-lg text-ivory mb-2 mt-0 font-semibold">
              Date of Birth
            </Text>
            <View className="flex w-full justify-center">
              <DateTimePicker
                value={new Date(info.dob ?? new Date()) ?? new Date()}
                maximumDate={new Date()}
                onChange={(d) => {
                  console.log(d);
                  setInfo({ ...info, dob: d.nativeEvent.timestamp });
                }}
                style={{
                  marginHorizontal: "auto",
                  transform: [{ translateX: -4 }],
                }}
              />
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
                <View className="flex flex-row justify-center -mt-6">
                  <Picker
                    className="h-12 text-ivory"
                    selectedValue={info.gs ?? "Javascript"}
                    style={{ width: 100 }}
                    onValueChange={(v) =>
                      setInfo({ ...info, gs: v.toString() })
                    }
                  >
                    <Picker.Item color="#fbfff1" label="O" value="O" />
                    <Picker.Item color="#fbfff1" label="A" value="A" />
                    <Picker.Item color="#fbfff1" label="B" value="B" />
                    <Picker.Item color="#fbfff1" label="AB" value="AB" />
                  </Picker>
                  <Picker
                    selectedValue={info.rh}
                    style={{ width: 100 }}
                    onValueChange={(v) =>
                      setInfo({ ...info, rh: v.toString() })
                    }
                  >
                    <Picker.Item color="#fbfff1" label="-" value="-" />
                    <Picker.Item color="#fbfff1" label="+" value="+" />
                  </Picker>
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
                      <Picker
                        selectedValue={info.assignedSex}
                        style={{ width: 100 }}
                        onValueChange={(v) =>
                          setInfo({ ...info, assignedSex: v })
                        }
                      >
                        <Picker.Item color="#fbfff1" label="M" value="M" />
                        <Picker.Item color="#fbfff1" label="F" value="F" />
                        <Picker.Item color="#fbfff1" label="O" value="O" />
                      </Picker>
                    </View>
                  </View>
                  {info.assignedSex != BirthSex.MALE && (
                    <Animated.View
                      entering={FadeInLeft.duration(500)}
                      exiting={FadeOutLeft.duration(500)}
                      className="flex justify-center"
                    >
                      <Text className="text-center w-24 text-lg text-ivory   font-semibold">
                        Pregnant
                      </Text>
                      <View className="flex flex-row justify-center -mt-6">
                        <Picker
                          selectedValue={info.pregnant}
                          style={{ width: 100 }}
                          onValueChange={(v) =>
                            setInfo({ ...info, pregnant: v })
                          }
                        >
                          <Picker.Item
                            color="#fbfff1"
                            label="Yes"
                            value={true}
                          />
                          <Picker.Item
                            color="#fbfff1"
                            label="No"
                            value={false}
                          />
                        </Picker>
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
              <Animated.View
                entering={FadeIn.duration(500)}
              >
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
              <Picker
                selectedValue={info.preferedSex}
                style={{ width: 100 }}
                onValueChange={(v) => setInfo({ ...info, preferedSex: v })}
              >
                <Picker.Item color="#fbfff1" label="M" value={BirthSex.MALE} />
                <Picker.Item
                  color="#fbfff1"
                  label="F"
                  value={BirthSex.FEMALE}
                />
                <Picker.Item
                  color="#fbfff1"
                  label="IS"
                  value={BirthSex.INTERSEX}
                />
              </Picker>
            </View>
          </Animated.View>
        ) : (
          <View>
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
          </View>
        )
      ) : (
        <View>
          <Text className="text-6xl text-ivory">DOCTR+OR SIGNUP FINALLL</Text>
        </View>
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
