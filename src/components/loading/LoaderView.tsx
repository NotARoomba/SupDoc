import { Text, View } from "react-native";
import Loader from "./Loader";

export default function LoaderView() {
  return (
    <View className="flex h-96 w-full">
      <View className="m-auto">
        <Loader />
        <Text className="text-ivory text-center font-semibold text-xl ">
          Loading
        </Text>
      </View>
    </View>
  );
}
