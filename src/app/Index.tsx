import { Doctor } from "@/backend/models/doctor";
import { STATUS_CODES } from "@/backend/models/util";
import prompt from "@powerdesigninc/react-native-prompt";
import { useLoading } from "components/hooks/useLoading";
import { usePosts } from "components/hooks/usePosts";
import { useSettings } from "components/hooks/useSettings";
import { useUser } from "components/hooks/useUser";
import {
  callAPI,
  isDoctorSignupInfo,
  isPatientSignupInfo,
  uploadImages,
} from "components/utils/Functions";
import CryptoJS from "crypto-es";
import { Image } from "expo-image";
import { SplashScreen } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Keyboard,
  Platform,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
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

export default function Index({ setIsLogged }: IndexProps) {
  // const [bgCoords, setBGCoords] = useState<Array<number>>([550, 200]);
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [userType, setUserType] = useState<UserType>();
  const { fetchUser } = useUser();
  const { fetchPosts } = usePosts();
  const [signUpInfo, setSignUpInfo] = useState<
    SignupInfo<UserType.DOCTOR> | SignupInfo<UserType.PATIENT>
  >({} as SignupInfo<UserType.PATIENT>);
  const [loginInfo, setLoginInfo] = useState<
    LoginInfo<UserType.DOCTOR> | LoginInfo<UserType.PATIENT>
  >({} as LoginInfo<UserType.PATIENT>);
  const [pageIndex, setIndex] = useState(0);
  const { setLoading } = useLoading();
  const { fetchSettings } = useSettings();
  const { t } = useTranslation();
  useEffect(() => {
    fetchSettings();
    SplashScreen.hideAsync();
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
      // publicKey: keys.public.replaceAll("RSA PUBLIC KEY", "PUBLIC KEY"), // R
      publicKey: keys.public, // R
      privateKey: encPriv.toString(), // R
    };
    // if (isDoctorSignupInfo(userType, signUpInfo))
    //   for (let i = 0; i < signUpInfo.license.length; i++)
    //     signUpInfo.license[i] =
    //       `data:image/png;base64,${await FileSystem.readAsStringAsync(
    //         signUpInfo.license[i],
    //         { encoding: "base64" },
    //       )}`;
    // if (isDoctorSignupInfo(userType, signUpInfo))
    //   console.log(signUpInfo.license[0].length / 1000);
    if (isDoctorSignupInfo(userType, signUpInfo)) {
      const res = await uploadImages(
        signUpInfo.license.concat(signUpInfo.picture),
      );
      if (res.status !== STATUS_CODES.SUCCESS) {
        setLoading(false);
        return Alert.alert(t("error"), t(STATUS_CODES[res.status]));
      }
      const [licence, picture] = [
        res.urls.slice(0, -1),
        res.urls[res.urls.length - 1],
      ];
      signUpInfo.license = licence;
      signUpInfo.picture = picture;
    }
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
              age: new Date(Date.now() - signUpInfo.dob).getFullYear(),
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
            picture: signUpInfo.picture,
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
      setLoading(false);
      setTimeout(() => Alert.alert(t("success"), t("successes.signup")), 250)
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
      // await fetchUser();
      // await fetchPosts();
      return setIsLogged(true);
    } else {
      setLoading(false);
      return Alert.alert(t("error"), t("errors.createUser"));
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
  }, [userType, isLogin]);
  const parseLogin = async () => {
    setLoading(true);
    const doesExist = await callAPI(`/users/check`, "POST", {
      id: loginInfo.identification,
    });
    if (doesExist.status !== STATUS_CODES.ID_IN_USE) {
      Alert.alert(t("error"), t("errors.INVALID_IDENTITY"));
      return setLoading(false);
    }
    const res = await callAPI("/verify/code/send", "POST", {
      number: parseInt(loginInfo.identification.toString()),
      userType,
    });
    setLoading(false);
    if (res.status === STATUS_CODES.ERROR_SENDING_CODE)
      return Alert.alert(t("error"), t("errors.CODE_FAILED"));
    else {
      setTimeout(() => {
        return prompt(
          t("verification.title"),
          t("verification.description") + res.number,
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
    const v = await callAPI("/verify/code/check", "POST", {
      number,
      code,
    });
    if (v.status !== STATUS_CODES.SUCCESS) {
      setLoading(false);
      // need to update wth localizations
      return Alert.alert("Error", v.status);
    }
    const res = await callAPI(`/users/keys`, "POST", {
      id: loginInfo.identification,
      userType,
    });
    if (res.status == STATUS_CODES.USER_NOT_FOUND) {
      setLoading(false);
      // need to update wth localizations
      return Alert.alert(
        t("error"),
        t("errors.loginNotFound", {
          userType: userType == UserType.DOCTOR ? t("doctor") : t("patient"),
        }),
      );
    } else if (res.status !== STATUS_CODES.SUCCESS) {
      setLoading(false);
      // need to update wth localizations
      return Alert.alert(t("error"), t("errors.password.wrong"));
    }
    const test = await RSA.encrypt(
      process.env.EXPO_PUBLIC_LIMITED_AUTH,
      res.public,
    );
    try {
      setLoading(false);
      const decrypted = CryptoJS.AES.decrypt(
        res.private,
        loginInfo.password,
      ).toString(CryptoJS.enc.Utf8);
      const isValid =
        (await RSA.decrypt(test, decrypted)) ==
        process.env.EXPO_PUBLIC_LIMITED_AUTH;
      if (!isValid) return Alert.alert(t("error"), t("errors.password.wrong"));
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
      // await fetchUser();
      // return setTimeout(() => {Alert.alert(t("success"), t("successes.login"));;}, 250);
      return setIsLogged(true)
    } catch (e) {
      setLoading(false);
      return Alert.alert(t("error"), t("errors.password.wrong"));
    }
  };
  const verifyPassword = (password: string): boolean => {
    // Check for at least one uppercase letter
    const hasUpperCase = /[A-Z]/.test(password);
    if (!hasUpperCase) {
      Alert.alert(t("error"), t("errors.password.uppercase"));
      return false;
    }

    // Check for at least one number
    const hasNumber = /\d/.test(password);
    if (!hasNumber) {
      Alert.alert(t("error"), t("errors.password.number"));
      return false;
    }

    // Check for at least one special character
    const hasSpecialChar = /[!@#$%^&*()_\-+=~`{}[\]:;"'<>,.?/\\|]/.test(
      password,
    );
    if (!hasSpecialChar) {
      Alert.alert(t("error"), t("errors.password.special"));
      return false;
    }

    // Check for minimum length of 8 characters
    const hasMinLength = password.length >= 8;
    if (!hasMinLength) {
      Alert.alert(t("error"), t("errors.password.minChrtr"));
      return false;
    }

    // If all checks pass, return true
    return true;
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
              setOption={(v) => setIsLogin(v == t("titles.login"))}
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
              setOption={(v) =>
                v == t("doctor")
                  ? setUserType(UserType.DOCTOR)
                  : setUserType(UserType.PATIENT)
              }
              selected={
                userType
                  ? userType == UserType.DOCTOR
                    ? t("doctor")
                    : t("patient")
                  : userType
              }
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
                  {t("buttons.back")}
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
                  pageIndex == 7)
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
                          ? t("errors.password.mismatch")
                          : t("errors.missingInfo"),
                      )
                    : (!isLogin ? verifyPassword(signUpInfo.password) : true)
                      ? !isLogin
                        ? signup()
                        : parseLogin()
                      : 0
                }
                className={
                  "  bg-oxforder_blue mx-auto px-32 py-2.5 transition-all duration-300 rounded-lg "
                }
              >
                <Text className="text-xl  text-ivory font-medium text-center">
                  {t("buttons.finish")}
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
                        !signUpInfo.about) ||
                      (pageIndex == 5 &&
                        userType &&
                        isDoctorSignupInfo(userType, signUpInfo) &&
                        signUpInfo.license.length == 0) ||
                      (pageIndex == 6 &&
                        userType &&
                        isDoctorSignupInfo(userType, signUpInfo) &&
                        !signUpInfo.picture)
                    : pageIndex == 1 && !userType
                )
                  ? Alert.alert(t("errors.missing"), t("errors.missingInfo"))
                  : setIndex(pageIndex + 1)
              }
              className="   bg-oxforder_blue mx-auto px-32   py-2.5 rounded-lg"
            >
              <Text className="text-xl text-ivory font-medium text-center">
                {t("buttons.next")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
