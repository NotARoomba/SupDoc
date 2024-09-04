import { Text, View } from "react-native";
import { LoginProps } from "../components/utils/Types";

export default function Login({ info, setIsLogged }: LoginProps) {
  return (
    <View>
      <Text className="text-6xl text-ivory">LOGIN</Text>
    </View>
  );
}
