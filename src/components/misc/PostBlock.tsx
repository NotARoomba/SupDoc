import { STATUS_CODES, UserType } from "@/backend/models/util";
import Icons from "@expo/vector-icons/Octicons";
import { callAPI } from "components/utils/Functions";
import { PostBlockProps } from "components/utils/Types";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Alert, Animated, Text, TouchableOpacity, View } from "react-native";
import Reanimated, {
  useAnimatedProps,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import useFade from "./useFade";
import { useState } from "react";

export default function PostBlock({
  post,
  userType,
  blur,
}: PostBlockProps) {
  const fadeAnim = useFade(true);
  const { t } = useTranslation();
  const [saved, setSaved] = useState(true);
  const ReanimatedBlurView = Reanimated.createAnimatedComponent(BlurView);
  const blurIntensity = useSharedValue(50);
  const animatedBlurProps = useAnimatedProps(() => ({
    intensity: withSpring(blurIntensity.value, { damping: 15, stiffness: 90 }),
  }));

  const savePost = async () => {
    const res = await callAPI(`/posts/${post._id?.toString()}/save`, "GET");
    if (res.status !== STATUS_CODES.SUCCESS)
      return Alert.alert(t("error"), t(STATUS_CODES[res.status]));
    else setSaved(!saved);
  };

  return (
    <Animated.View
      style={{ opacity: fadeAnim }}
      className={
        "h-fit flex w-11/12 bg-midnight_green-500/60 mt-4 p-4 rounded-2xl mx-auto "
      }
    >
      <View className="justify-between flex flex-row">
        <Text className="text-ivory text-2xl font-bold mb-4">{post.title}</Text>
        {userType === UserType.DOCTOR && (
          <TouchableOpacity onPress={savePost}>
            <Icons
              color={"#fbfff1"}
              name={saved ? "bookmark-slash" : "bookmark"}
              size={40}
            />
          </TouchableOpacity>
        )}
      </View>
      <View className="flex h-44 flex-row w-full gap-x-4 mb-4">
        <View className="w-6/12 aspect-square relative rounded-xl overflow-hidden">
          <TouchableOpacity
            onPress={(e) => {
              e.preventDefault();
              blurIntensity.value = blurIntensity.value === 50 ? 0 : 50;
            }}
          >
            <ReanimatedBlurView
              animatedProps={animatedBlurProps}
              className="h-full absolute w-full z-50"
            />
            <Image
              className="h-full w-full rounded-xl"
              source={{ uri: post.images[0] }}
            />
          </TouchableOpacity>
        </View>
        <View className="w-5/12">
          <Text className="text-ivory font-medium overflow-ellipsis">
            {post.description}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() =>
          router.navigate({
            pathname: "/Post",
            params: { id: post._id?.toString() },
          })
        }
      >
        <View className="flex flex-row rounded-xl bg-powder_blue/30 p-1 px-2 justify-between">
          <Text className="text-ivory text-lg my-auto font-medium">
            {post.comments.length}/3 Doctors have commented
          </Text>
          <View className="-mb-1">
            <Icons color={"#fbfff1"} name="arrow-right" size={36} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
