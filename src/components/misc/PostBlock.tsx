import Icons from "@expo/vector-icons/Octicons";
import { PostBlockProps } from "components/utils/Types";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { Animated, Platform, Text, TouchableOpacity, View } from "react-native";
import useFade from "./useFade";

export default function PostBlock({ post, userType, saved }: PostBlockProps) {
  const fadeAnim = useFade();
  const { t } = useTranslation();
  const savePost = () => {
    /// post to save post for doctors
  };
  return (
    <Animated.View
      style={{ opacity: fadeAnim }}
      className={
        "h-fit w-11/12 bg-midnight_green-300 my-2 p-6 rounded-2xl mx-auto " +
        (Platform.OS == "ios" ? "pt-6" : "pt-16")
      }
    >
      <View className="justify-between flex flex-row">
        <Text className="text-ivory text-2xl font-bold">{post.title}</Text>
        {!userType && (
          <TouchableOpacity onPress={savePost}>
            <Icons
              color={"#fbfff1"}
              name={saved ? "bookmark-slash" : "bookmark"}
              size={40}
            />
          </TouchableOpacity>
        )}
      </View>
      <View className="flex flex-row w-full justify-around">
        <View className="w-5/12 aspect-square">
          <Image className="h-full w-full" />
        </View>
      </View>
    </Animated.View>
  );
}
