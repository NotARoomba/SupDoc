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
  PatientSignupInfo,
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
import { callAPI, isDoctorInfo, isPatientInfo } from "components/utils/Functions";
import Spinner from "react-native-loading-spinner-overlay";
import CryptoJS from 'crypto-es'

export default function Index({ setIsLogged }: IndexProps) {
  // const [bgCoords, setBGCoords] = useState<Array<number>>([550, 200]);
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [userType, setUserType] = useState<UserType>();
  const [signUpInfo, setSignUpInfo] = useState<
    SignupInfo<UserType.DOCTOR> | SignupInfo<UserType.PATIENT>
  >({} as SignupInfo<UserType.PATIENT>);
  const [loginInfo, setLoginInfo] = useState<
    LoginInfo<UserType.DOCTOR> | LoginInfo<UserType.PATIENT>
  >({} as LoginInfo<UserType.PATIENT>);
  const [pageIndex, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
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
      `/${userType == UserType.PATIENT ? "patients" : "doctors"}/check`,
      "POST",
      {
        id: signUpInfo.identification,
        number: (signUpInfo.countryCode + signUpInfo.number),
      },
    );
    console.log(doesExist);
    if (doesExist.status !== STATUS_CODES.GENERIC_ERROR) {
      if (doesExist.status === STATUS_CODES.ID_IN_USE)
         {setLoading(false); return Alert.alert("Error", "The ID is already in use!");}
      else if (doesExist.status === STATUS_CODES.NUMBER_IN_USE)
      {setLoading(false); return Alert.alert("Error", "The number is already in use!");}
      const res = await callAPI("/verify/code/send", "POST", {
        number: (signUpInfo.countryCode + signUpInfo.number),
      });
      setLoading(false);
      console.log(signUpInfo.countryCode + signUpInfo.number)
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
            "Enter the verification code sent to: " + (signUpInfo.countryCode + signUpInfo.number),
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
    console.log(code)
    if (!userType) return;
    console.log("ASDASD")
    setLoading(true);
    const v = await callAPI("/verify/code/check", "POST", {
      number: (signUpInfo.countryCode + signUpInfo.number),
      code,
    });
    if (v.status !== STATUS_CODES.SUCCESS) {
      setLoading(false);
      // need to update wth localizations
      return Alert.alert("Error", v.status);
    }
    console.log("ASDASD")
    const keys = await RSA.generateKeys(2048);
    const encPriv = CryptoJS.AES.encrypt(keys.private, signUpInfo.password);
    const create = await callAPI(
      `/${userType == UserType.PATIENT ? "patients" : "doctors"}/create`,
      "POST",
      isPatientInfo(userType, signUpInfo)
        ? {
            number: signUpInfo.countryCode + signUpInfo.number,
            dateJoined: new Date().getTime(), // D
            publicKey: keys.public, // R
            privateKey: encPriv, // R
            identification: {
              number: signUpInfo.identification,
            },
            metrics: {
              age: Date.now() - (signUpInfo.dob ?? 0),
            },
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
  useEffect(() => {
    // Initialize the state with appropriate structure based on signup/login
    if (!isLogin) {
      if (userType === UserType.DOCTOR) {
        setSignUpInfo({
          password: "",
          passwordchk: "",
          countryCode: "+57",
          identification: 0, // Required for Signup as Doctor
          license: "", // Required for Signup as Doctor
          isVerified: false, // Example field for doctor signup
        } as SignupInfo<UserType.DOCTOR>);
      } else if (userType === UserType.PATIENT) {
        setSignUpInfo({
          password: "",
          passwordchk: "",
          countryCode: "+57",
          identification: 0, 
          dob: Date.now(), // Required for patient signup
          weight: 0, // Required for patient signup
          height: 0, // Required for patient signup
          gs: "O", // Blood group required for patient signup
          rh: "-", // RH factor required for patient signup
          sex: "M",
          altSex: "M",
        } as SignupInfo<UserType.PATIENT>);
      }
    } else {
      // Initialize LoginInfo for login
      setLoginInfo({
        identification: 0, // Common field for login (both doctor and patient)
        password: "",
      } as LoginInfo);
    }
  }, [userType]);
  const parseLogin = async () => {};
  return (
    <TouchableWithoutFeedback className="h-full" onPress={Keyboard.dismiss}>
      <View className="flex flex-col h-full bg-richer_black ">
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
              setOption={(v) => setUserType(v as UserType)}
              selected={userType}
            />
          </Animated.View>
        ) : (
          <>
            {isLogin ? (
              <Login
                setIsLogged={setIsLogged}
                setIndex={setIndex}
                index={pageIndex}
                setInfo={setLoginInfo}
                userType={userType ?? UserType.PATIENT}
                info={
                  userType
                    ? (loginInfo as LoginInfo<typeof userType>)
                    : (loginInfo as LoginInfo<UserType.PATIENT>)
                }
              />
            ) : (
              <Signup
                setIndex={setIndex}
                setIsLogged={setIsLogged}
                index={pageIndex}
                userType={userType ?? UserType.PATIENT}
                setInfo={setSignUpInfo}
                cameraOpen={cameraOpen}
                setCameraOpen={setCameraOpen}
                info={
                  userType
                    ? (signUpInfo as SignupInfo<typeof userType>)
                    : (signUpInfo as SignupInfo<UserType.PATIENT>)
                }
              />
            )}
          </>
        )}
        {!cameraOpen && <View
          className={
            "flex flex-col absolute gap-y-4 w-full z-10 " +
            (Platform.OS === "android" ? " bottom-4 " : "bottom-24")
          }
        >
          {pageIndex > 0 && (
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
          )}
          {/* Check for the other 4 routes that are possible */}
          {(userType &&
          isPatientInfo(userType, signUpInfo) &&
          (signUpInfo.trans ? pageIndex == 6 : pageIndex == 5)) || (userType && isDoctorInfo(userType, signUpInfo) && pageIndex == 4) ? (
            <Animated.View
              entering={FadeIn.duration(500)}
              exiting={FadeOut.duration(500)}
            >
              <TouchableOpacity
                onPress={() => signUpInfo.passwordchk.length == 0 || signUpInfo.passwordchk !== signUpInfo.password ? Alert.alert("Error", "The passwords do not match!") : (!isLogin ? parseSignup() : parseLogin())}
                className={
                  "  bg-oxforder_blue mx-auto px-32 py-2.5 transition-all duration-300 rounded-lg "
                }
              >
                <Text className="text-xl  text-ivory font-medium text-center">
                  Finish
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <TouchableOpacity
              onPress={() =>
                (
                  !isLogin
                    ? (pageIndex == 1 && !userType) ||
                      (pageIndex == 2 &&
                        (!signUpInfo.number || !signUpInfo.identification)) ||
                      (pageIndex == 3 &&
                        userType &&
                        isPatientInfo(userType, signUpInfo) &&
                        (!signUpInfo.height || !signUpInfo.weight)) ||
                      (pageIndex == 4 &&
                        userType &&
                        isPatientInfo(userType, signUpInfo) &&
                        (signUpInfo.trans == undefined || signUpInfo.trans
                          ? signUpInfo.hormones == undefined ||
                            signUpInfo.surgery == undefined
                          : false)) ||
                      (userType &&
                        isPatientInfo(userType, signUpInfo) &&
                        (signUpInfo.trans ? pageIndex == 6 : pageIndex == 5) &&
                        (!signUpInfo.password || !signUpInfo.passwordchk)) || (pageIndex == 3 && userType && isDoctorInfo(userType, signUpInfo) && signUpInfo.license.length == 0)
                    : false
                )
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
            </TouchableOpacity>
          )}
        </View>}
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
