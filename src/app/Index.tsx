import { Doctor } from "@/backend/models/doctor";
import { STATUS_CODES } from "@/backend/models/util";
import prompt from "@powerdesigninc/react-native-prompt";
import Loader from "components/misc/Loader";
import {
  callAPI,
  isDoctorSignupInfo,
  isPatientSignupInfo,
  verifyPassword,
} from "components/utils/Functions";
import CryptoJS from "crypto-es";
import * as FileSystem from "expo-file-system";
import { Image } from "expo-image";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  Platform,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { RSA } from "react-native-rsa-native";
import Slider from "../components/buttons/Slider";
import {
  IndexProps,
  LoginInfo,
  SignupInfo,
  UserType,
} from "../components/utils/Types";
import Login from "./Login";
import Signup from "./Signup";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
  const signup = async () => {
    if (!userType) return;
    setLoading(true);
    const keys = await RSA.generateKeys(2048);
    const encPriv = CryptoJS.AES.encrypt(keys.private, signUpInfo.password);
    let sexData = {};
    if (isPatientSignupInfo(userType, signUpInfo))
      sexData = signUpInfo.trans
        ? {
            altSex: signUpInfo.altSex,
            surgery: signUpInfo.surgery,
            hormones: signUpInfo.hormones,
          }
        : {};
    const sharedData = {
      number: signUpInfo.countryCode + signUpInfo.number,
      dateJoined: new Date().getTime(), // D
      publicKey: keys.public, // R
      privateKey: encPriv.toString(), // R
    };
    if (isDoctorSignupInfo(userType, signUpInfo))
      for (let i = 0; i < signUpInfo.license.length; i++)
        signUpInfo.license[i] = await FileSystem.readAsStringAsync(
          signUpInfo.license[i],
          { encoding: "base64" },
        );
    if (isDoctorSignupInfo(userType, signUpInfo))
      console.log(signUpInfo.license[0].length / 1000);
    const create = await callAPI(
      `/${userType == UserType.PATIENT ? "patients" : "doctors"}/create`,
      "POST",
      isPatientSignupInfo(userType, signUpInfo)
        ? {
            ...sharedData,
            identification: {
              number: signUpInfo.identification,
            },
            info: {
              age: new Date(Date.now() - (signUpInfo.dob ?? 0)).getFullYear(),
              weight: signUpInfo.weight,
              height: signUpInfo.height,
              dob: signUpInfo.dob,
              sex: signUpInfo.sex,
              blood: signUpInfo.gs + signUpInfo.rh,
              pregnant: signUpInfo.pregnant ?? false,
              ...sexData,
            },
          }
        : ({
            name: signUpInfo.firstName + " " + signUpInfo.lastName,
            ...sharedData,
            picture: await FileSystem.readAsStringAsync(signUpInfo.picture, {
              encoding: "base64",
            }),
            info: {
              specialty: signUpInfo.specialty,
              experience: signUpInfo.experience,
              about: signUpInfo.about,
            },
            identification: {
              license: signUpInfo.license,
              number: signUpInfo.identification,
            },
          } as Doctor),
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
      await SecureStore.setItemAsync(
        process.env.EXPO_PUBLIC_KEY_NAME_TYPE,
        userType,
      );
      await SecureStore.setItemAsync(
        process.env.EXPO_PUBLIC_KEY_NAME_PASS,
        signUpInfo.password,
      );
      return setIsLogged(true);
    } else {
      console.log(create);
      setLoading(false);
      return Alert.alert("Error", "There was an error creating a user!");
    }
  };
  useEffect(() => {
    // Initialize the state with appropriate structure based on signup/login
    if (!isLogin) {
      if (userType === UserType.DOCTOR) {
        setSignUpInfo({
          password: "",
          firstName: "",
          lastName: "",
          specialty: "",
          experience: "",
          about: "",
          passwordchk: "",
          picture: "",
          countryCode: "+57",
          identification: 0, // Required for Signup as Doctor
          license: Array<string>(), // Required for Signup as Doctor
          isVerified: false, // Example field for doctor signup
        } as SignupInfo<UserType.DOCTOR>);
      } else if (userType === UserType.PATIENT) {
        setSignUpInfo({
          password: "",
          passwordchk: "",
          countryCode: "+57",
          identification: 0,
          number: "",
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
  const parseLogin = async () => {
    setLoading(true);
    const doesExist = await callAPI(`/users/check`, "POST", {
      id: loginInfo.identification,
    });
    if (doesExist.status !== STATUS_CODES.ID_IN_USE) {
      Alert.alert("Error", "There is no user with that ID!");
      return setLoading(false);
    }
    const res = await callAPI("/verify/code/send", "POST", {
      number: loginInfo.identification,
    });
    setLoading(false);
    if (res.status === STATUS_CODES.ERROR_SENDING_CODE)
      return Alert.alert("Error", "There was an error sending the code!");
    else {
      setTimeout(() => {
        return prompt(
          "Enter Verification Code",
          "Enter the verification code sent to: " + res.number,
          async (input) => await checkLogin(input, res.number),
          "plain-text",
          "",
          "number-pad",
        );
      }, 250);
    }
  };
  const checkLogin = async (code: string, number: string) => {
    if (!userType) return;
    setLoading(true);
    // const v = await callAPI("/verify/code/check", "POST", {
    //   number,
    //   code,
    // });
    // if (v.status !== STATUS_CODES.SUCCESS) {
    //   setLoading(false);
    //   // need to update wth localizations
    //   return Alert.alert("Error", v.status);
    // }
    const res = await callAPI(`/users/keys`, "POST", {
      id: loginInfo.identification,
      userType,
    });
    if (res.status == STATUS_CODES.USER_NOT_FOUND) {
      setLoading(false);
      // need to update wth localizations
      return Alert.alert("Error", `${userType} not found with that ID`);
    } else if (res.status !== STATUS_CODES.SUCCESS) {
      setLoading(false);
      // need to update wth localizations
      return Alert.alert("Error", "Wrong password");
    }
    const test = await RSA.encrypt(
      process.env.EXPO_PUBLIC_LIMITED_AUTH,
      res.public,
    );
    try {
      const decrypted = CryptoJS.AES.decrypt(
        res.private,
        loginInfo.password,
      ).toString(CryptoJS.enc.Utf8);
      const isValid =
        (await RSA.decrypt(test, decrypted)) ==
        process.env.EXPO_PUBLIC_LIMITED_AUTH;
      if (!isValid) return Alert.alert("Error", "Wrong password!");
      await SecureStore.setItemAsync(
        process.env.EXPO_PUBLIC_KEY_NAME_PRIVATE,
        decrypted,
      );
      await SecureStore.setItemAsync(
        process.env.EXPO_PUBLIC_KEY_NAME_PUBLIC,
        res.public,
      );
      await SecureStore.setItemAsync(
        process.env.EXPO_PUBLIC_KEY_NAME_TYPE,
        userType,
      );
      await SecureStore.setItemAsync(
        process.env.EXPO_PUBLIC_KEY_NAME_PASS,
        loginInfo.password,
      );
      setLoading(false);
      Alert.alert("Success!", "You are now signed in!");
      return setIsLogged(true);
    } catch (e) {
      setLoading(false);
      return Alert.alert("Error", "Wrong password!");
    }
  };
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
              options={[t("titles.login"), t("titles.register")]}
              setOption={(v) => setIsLogin(v ==  t("titles.login"))}
              selected={isLogin ? t("titles.login") : t("titles.register")}
            />
          </Animated.View>
        ) : pageIndex == 1 ? (
          <Animated.View
            key={pageIndex}
            entering={FadeIn.duration(500)}
            className="flex mt-4 "
          >
            <Slider
              options={[t("doctor"), t("patient")]}
              setOption={(v) => v ==  t("doctor") ? setUserType(UserType.DOCTOR) :setUserType(UserType.PATIENT) }
              selected={userType}
            />
          </Animated.View>
        ) : (
          <>
            {isLogin ? (
              <Login
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
                info={
                  userType
                    ? (signUpInfo as SignupInfo<typeof userType>)
                    : (signUpInfo as SignupInfo<UserType.PATIENT>)
                }
              />
            )}
          </>
        )}
        <View
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
                {t('buttons.back')}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
          {/* Check for the other 4 routes that are possible */}
          {(
            !isLogin
              ? (userType &&
                  isPatientSignupInfo(userType, signUpInfo) &&
                  (signUpInfo.trans ? pageIndex == 6 : pageIndex == 5)) ||
                (userType &&
                  isDoctorSignupInfo(userType, signUpInfo) &&
                  pageIndex == 8)
              : pageIndex == 2
          ) ? (
            <Animated.View
              entering={FadeIn.duration(500)}
              exiting={FadeOut.duration(500)}
            >
              <TouchableOpacity
                onPress={() =>
                  (
                    !isLogin
                      ? signUpInfo.passwordchk.length == 0 ||
                        signUpInfo.passwordchk !== signUpInfo.password
                      : loginInfo.identification == 0 ||
                        loginInfo.password.length == 0
                  )
                    ? Alert.alert(
                        t("error"),
                        !isLogin
                          ? t("errors.mismatchPassword")
                          : t("errors.missingInfo"),
                      )
                    : (!isLogin ? verifyPassword(signUpInfo.password) : true)
                      ? !isLogin
                        ? signup()
                        : checkLogin("7", "8")
                      : 0
                }
                className={
                  "  bg-oxforder_blue mx-auto px-32 py-2.5 transition-all duration-300 rounded-lg "
                }
              >
                <Text className="text-xl  text-ivory font-medium text-center">
                {t('buttons.finish')}
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
                        isPatientSignupInfo(userType, signUpInfo) &&
                        (!signUpInfo.height || !signUpInfo.weight)) ||
                      (pageIndex == 4 &&
                        userType &&
                        isPatientSignupInfo(userType, signUpInfo) &&
                        (signUpInfo.trans == undefined || signUpInfo.trans
                          ? signUpInfo.hormones == undefined ||
                            signUpInfo.surgery == undefined
                          : false)) ||
                      (userType &&
                        isPatientSignupInfo(userType, signUpInfo) &&
                        (signUpInfo.trans ? pageIndex == 6 : pageIndex == 5) &&
                        (!signUpInfo.password || !signUpInfo.passwordchk)) ||
                      (pageIndex == 3 &&
                        userType &&
                        isDoctorSignupInfo(userType, signUpInfo) &&
                        (!signUpInfo.firstName || !signUpInfo.lastName)) ||
                      (pageIndex == 4 &&
                        userType &&
                        isDoctorSignupInfo(userType, signUpInfo) &&
                        (!signUpInfo.specialty || !signUpInfo.experience)) ||
                      (pageIndex == 5 &&
                        userType &&
                        isDoctorSignupInfo(userType, signUpInfo) &&
                        !signUpInfo.about) ||
                      (pageIndex == 6 &&
                        userType &&
                        isDoctorSignupInfo(userType, signUpInfo) &&
                        signUpInfo.license.length == 0) ||
                      (pageIndex == 7 &&
                        userType &&
                        isDoctorSignupInfo(userType, signUpInfo) &&
                        !signUpInfo.picture)
                    : pageIndex == 1 && !userType
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
                {t('buttons.next')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <Spinner
          visible={loading}
          overlayColor="#000000cc"
          textContent={"Loading"}
          customIndicator={<Loader />}
          textStyle={{ color: "#fbfff1", marginTop: -25 }}
          animation="fade"
        />
      </View>
    </TouchableWithoutFeedback>
  );
}
