import { Text, View } from "react-native";
import { LoginProps } from "../components/utils/Types";
import Animated, { FadeIn } from "react-native-reanimated";

export default function Login({
  info,
  setIsLogged,
  userType,
  setInfo,
  index,
}: LoginProps) {
  return (
    <View className="h-full ">
      <Animated.Text
        entering={FadeIn.duration(500)}
        key={index}
        className="text-5xl text-ivory font-bold text-center mb-8"
      >
        Login
      </Animated.Text>
    </View>
  );
}
