import {
  Alert,
  Button,
  Keyboard,
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  IndexProps,
  LoginInfo,
  SignupInfo,
  UserType,
} from "../components/utils/Types";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useEffect, useState } from "react";
import { Image } from "expo-image";
import Slider from "../components/buttons/Slider";
import Login from "./Login";
import { RSA } from "react-native-rsa-native";
import * as SecureStore from "expo-secure-store";
import Signup from "./Signup";
import { STATUS_CODES } from "@/backend/models/util";
import Loader from "components/misc/Loader";
import { callAPI } from "components/utils/Functions";
import Spinner from "react-native-loading-spinner-overlay";

export default function Index({ setIsLogged }: IndexProps) {
  // const [bgCoords, setBGCoords] = useState<Array<number>>([550, 200]);
  const [isLogin, setIsLogin] = useState<boolean>();
  const [info, setInfo] = useState<SignupInfo | LoginInfo>();
  const [pageIndex, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    // check if key if not then create one and if theres a key check if it exists and login
    const onLoad = async () => {
      // let result = await SecureStore.getItemAsync(
      //   env.EXPO_PUBLIC_KEY_NAME_PUBLIC,
      // );
      // if (!result) {
      //   const keys = await RSA.generateKeys(2048);
      //   await SecureStore.setItemAsync(
      //     env.EXPO_PUBLIC_KEY_NAME_PUBLIC,
      //     keys.public,
      //   );
      //   await SecureStore.setItemAsync(
      //     env.EXPO_PUBLIC_KEY_NAME_PRIVATE,
      //     keys.private,
      //   );
      // }
    };
    onLoad();
  }, []);
  const parseSignup = async () => {
    //checl if passswords are the same
    setLoading(true);
    const doesExist = await callAPI(
      `/${info?.type == UserType.PATIENT ? "patients" : "doctors"}/check`,
      "POST",
      {
        id: info?.identification,
        number: info?.number,
      },
    );
    if (doesExist.status !== STATUS_CODES.GENERIC_ERROR) {
      setLoading(false);
      if (doesExist.status === STATUS_CODES.ID_IN_USE)
        return Alert.alert("Error", "The ID is already in use!");
      else if (doesExist.status === STATUS_CODES.NUMBER_IN_USE)
        return Alert.alert("Error", "The number is already in use!");
      const res = await callAPI("/verify/code/send", "POST", {
        number: info?.number,
      });
      if (res.status === STATUS_CODES.INVALID_NUMBER)
        return Alert.alert("Error", "That number is invalid!");
      else if (res.status === STATUS_CODES.NUMBER_NOT_EXIST)
        return Alert.alert("Error", "That number does not exist!");
      else if (res.status === STATUS_CODES.ERROR_SENDING_CODE)
        return Alert.alert("Error", "There was an error sending the code!");
      else {
        setTimeout(() => {
          return Alert.prompt(
            "Enter Verification Code",
            "Enter the verification code sent to: " + info?.number,
            async (input) => await checkSignup(input),
            "plain-text",
            "",
            "number-pad",
          );
        }, 250);
      }
    } else {
      setLoading(false);
      return Alert.alert("Error", "An error occured!");
    }
  };
  const checkSignup = async (code: string) => {
    setLoading(true);
    const v = await callAPI("/verify/code/check", "POST", {
      number: info?.number,
      code,
    });
    if (v.status !== STATUS_CODES.SUCCESS || !info || !("rh" in info)) {
      setLoading(false);
      return Alert.alert("Error", v.status);
    }
    const keys = await RSA.generateKeys(2048);
    const encPriv = CryptoJS.AES.encrypt(keys.private, info.password);
    const create = await callAPI(
      `/${info?.type == UserType.PATIENT ? "patients" : "doctors"}/create`,
      "POST",
      info?.type == UserType.PATIENT
        ? {
            number: info.number,
            dateJoined: new Date().getTime(), // D
            publicKey: keys.public, // R
            privateKey: encPriv, // R
          }
        : {},
    );
    if (create.status === STATUS_CODES.SUCCESS) {
      Alert.alert("Success", "You are now registered!");
      await SecureStore.setItemAsync(
        process.env.EXPO_PUBLIC_KEY_NAME_PRIVATE,
        keys.private,
      );
      await SecureStore.setItemAsync(
        process.env.EXPO_PUBLIC_KEY_NAME_PUBLIC,
        keys.public,
      );
      return setIsLogged(true);
    }
  };
  const parseLogin = async () => {};
  return (
    <TouchableWithoutFeedback className="h-full" onPress={Keyboard.dismiss}>
      <View className="flex flex-col relative  h-full bg-richer_black ">
        <Image
          source={require("assets/images/icon.png")}
          className="h-32 my-4 mx-auto aspect-square rounded-xl"
        />
        {pageIndex == 0 ? (
          <Animated.View
            key={pageIndex}
            entering={FadeIn.duration(500)}
            className="flex mt-4 "
          >
            <Slider
              options={["Login", "Signup"]}
              setOption={(v) => setIsLogin(v == "Login")}
              selected={isLogin ? "Login" : "Signup"}
            />
          </Animated.View>
        ) : pageIndex == 1 ? (
          <Animated.View
            key={pageIndex}
            entering={FadeIn.duration(500)}
            className="flex mt-4 "
          >
            <Slider
              options={["Doctor", "Patient"]}
              setOption={(v) => setInfo({ ...info, type: v as UserType })}
              selected={info?.type}
            />
          </Animated.View>
        ) : (
          <>
            {isLogin ? (
              <Login
                setIsLogged={setIsLogged}
                setIndex={setIndex}
                index={pageIndex}
                setInfo={setInfo}
                info={info as LoginInfo}
              />
            ) : (
              <Signup
                setIndex={setIndex}
                setIsLogged={setIsLogged}
                index={pageIndex}
                setInfo={setInfo}
                info={info as SignupInfo}
              />
            )}
          </>
        )}
        <View
          className={
            "flex flex-col absolute gap-y-4 w-full " +
            (Platform.OS === "android" ? " bottom-4 " : "bottom-24")
          }
        >
          {(
            pageIndex > 0 && (
              <Animated.View
                entering={FadeIn.duration(500)}
                exiting={FadeOut.duration(500)}
              >
                <TouchableOpacity
                  onPress={() => setIndex(Math.max(pageIndex - 1, 0))}
                  className={
                    "  bg-oxforder_blue mx-auto px-32 py-2.5 transition-all duration-300 rounded-lg "
                  }
                >
                  <Text className="text-xl  text-ivory font-medium text-center">
                    Back
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            )
          )}
          {/* Check for the other 4 routes that are possible */}
          {pageIndex == 5 && info?.type == UserType.PATIENT && "rh" in info ? (
            <Animated.View
              entering={FadeIn.duration(500)}
              exiting={FadeOut.duration(500)}
            >
              <TouchableOpacity
                onPress={() =>
                  info.type == UserType.PATIENT && "rh" in info
                    ? parseSignup()
                    : parseLogin()
                }
                className={
                  "  bg-oxforder_blue mx-auto px-32 py-2.5 transition-all duration-300 rounded-lg "
                }
              ><Text className="text-xl  text-ivory font-medium text-center">
                  Finish
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ) : (<TouchableOpacity
            onPress={() =>
              (pageIndex == 1 && !info?.type) ||
              (pageIndex == 2 && (!info?.number || !info?.identification)) ||
              (pageIndex == 3 &&
                info &&
                "rh" in info &&
                (!info.height || !info.weight))
                ? Alert.alert(
                    "Missing Info",
                    "Please fill out the information!",
                  )
                : setIndex(pageIndex + 1)
            }
            className="   bg-oxforder_blue mx-auto px-32   py-2.5 rounded-lg"
          >
            <Text className="text-xl text-ivory font-medium text-center">
              Next
            </Text>
          </TouchableOpacity>)}
        </View>
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
