import {
  Button,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  IndexProps,
  LoginInfo,
  SignupInfo,
  UserType,
} from "../components/utils/Types";
import { FadeIn, FadeOut } from "react-native-reanimated";
import { useEffect, useState } from "react";
import { Image } from "expo-image";
import Slider from "../components/buttons/Slider";
import Login from "./Login";
import { RSA } from "react-native-rsa-native";
import * as SecureStore from "expo-secure-store";
import Signup from "./Signup";

export default function Index({ setIsLogged }: IndexProps) {
  // const [bgCoords, setBGCoords] = useState<Array<number>>([550, 200]);
  const [isLogin, setIsLogin] = useState<boolean>();
  const [info, setInfo] = useState<SignupInfo | LoginInfo>();
  const [pageIndex, setIndex] = useState(0);
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
  // const [state, ]
  return (
    <View className="flex flex-col  h-full bg-richer_black ">
      <Image
        source={require("assets/images/icon.png")}
        className="h-44 mt-16 mb-8 mx-auto aspect-square rounded-xl"
      />
      {pageIndex == 0 ? (
        <Slider
          options={["Login", "Signup"]}
          setOption={(v) => setIsLogin(v == "Login")}
          selected={isLogin ? "Login" : "Signup"}
        />
      ) : pageIndex == 1 ? (
        <Slider
          options={["Doctor", "Patient"]}
          setOption={(v) => setInfo({ ...info, type: v as UserType })}
          selected={info?.type}
        />
      ) : (
        <>
          {isLogin ? (
            <Login
              setIsLogged={setIsLogged}
              setIndex={setIndex}
              index={pageIndex}
              info={info as LoginInfo}
            />
          ) : (
            <Signup
              setIndex={setIndex}
              setIsLogged={setIsLogged}
              index={pageIndex}
              info={info as SignupInfo}
            />
          )}
        </>
      )}
      <View className="flex flex-col absolute bottom-48 gap-y-4 w-full ">
        {pageIndex > 0 && (
          <TouchableOpacity
            onPress={() => setIndex(Math.max(pageIndex - 1, 0))}
            className={
              "  bg-oxforder_blue mx-auto px-32 py-2.5 transition-all duration-300 rounded-lg " +
              (pageIndex > 0 ? "animate-show" : "animate-hide")
            }
          >
            <Text className="text-xl text-ivory font-bold text-center">
              Back
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => setIndex(pageIndex + 1)}
          className="   bg-oxforder_blue mx-auto px-32   py-2.5 rounded-lg"
        >
          <Text className="text-xl text-ivory font-bold text-center">Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
