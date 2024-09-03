import {
  Button,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { IndexProps, SignupInfo, UserType } from "../components/utils/types";
import { FadeIn, FadeOut } from "react-native-reanimated";
import { useEffect, useState } from "react";
import { Image } from "expo-image";
import Slider from "../components/buttons/Slider";

export default function Index({ setIsLogged }: IndexProps) {
  // const [bgCoords, setBGCoords] = useState<Array<number>>([550, 200]);
  const [isLogin, setIsLogin] = useState<boolean>();
  const [info, setInfo] = useState<SignupInfo>();
  const [pageIndex, setIndex] = useState(0);
  useEffect(() => {
    console.log(isLogin);
  }, [isLogin]);
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
        />
      ) : pageIndex == 1 ? (
        <Slider
          options={["Doctor", "Patient"]}
          setOption={(v) => setInfo({ ...info, type: v as UserType })}
        />
      ) : (
        <Text className="text-white">AAAAA</Text>
      )}
      <View
        className="absolute left-1/2 -translate-1/2 flex flex-col bottom-48 gap-4"
        style={{ transform: [{ translateX: -101.75 }] }}
      >
        {pageIndex > 0 && (
          <TouchableOpacity
            onPress={() => setIndex(Math.max(pageIndex - 1, 0))}
            className={
              "  bg-oxforder_blue px-20  left-1/2  py-2 transition-all duration-300 rounded-xl " +
              (pageIndex > 0 ? "animate-show" : "animate-hide")
            }
            style={{ transform: [{ translateX: -101.75 }] }}
          >
            <Text className="text-xl text-ivory font-medium">Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => setIndex(pageIndex + 1)}
          className="   bg-oxforder_blue px-20  left-1/2  py-2 rounded-xl"
          style={{ transform: [{ translateX: -101.75 }] }}
        >
          <Text className="text-xl text-ivory font-medium">Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
