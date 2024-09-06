import { LoadingScreenProps } from "components/utils/Types";
import { Text, View } from "react-native";
import Loader from "./Loader";

export default function LoadingScreen({ show, text }: LoadingScreenProps) {
  return (
    show && (
      <View className=" h-screen z-50  w-screen absolute top-0 left-0 justify-center bg-richer_black/20">
        <View className="m-auto gap-4">
          <Loader />
          <Text className="font-semibold text-ivory">{text}</Text>
        </View>
      </View>
    )
  );
}
