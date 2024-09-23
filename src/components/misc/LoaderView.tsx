import { Text, View } from "react-native";
import Loader from "./Loader";

export default function LoaderView() {
  return (
    <View className="m-auto flex h-full w-full">
      <View className="m-auto">
        <Loader />
        <Text className="text-ivory text-center mt-2 font-semibold text-xl ">
          Loading
        </Text>
      </View>
    </View>
  );
}
