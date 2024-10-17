import { UserType } from "@/backend/models/util";
import Icons from "@expo/vector-icons/Octicons";
import useFade from "components/hooks/useFade";
import { usePosts } from "components/hooks/usePosts";
import { PostBlockProps } from "components/utils/Types";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import Reanimated, {
  FadeIn,
  FadeOut,
  useAnimatedProps,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Skeleton from "react-native-reanimated-skeleton";

export default function PostBlock({
  post,
  userType,
  saved,
  listRef,
}: PostBlockProps) {
  const fadeAnim = useFade(true);
  const [s, setSaved] = useState(saved);
  const { t } = useTranslation();
  const [pictureLoading, setPictureLoading] = useState(true);
  const { savePost, savedPosts } = usePosts();
  const ReanimatedBlurView = Reanimated.createAnimatedComponent(BlurView);
  const blurIntensity = useSharedValue(50);
  const { colorScheme } = useColorScheme();
  const animatedBlurProps = useAnimatedProps(() => ({
    intensity: withSpring(blurIntensity.value, { damping: 15, stiffness: 90 }),
  }));
  useEffect(() => {
    setSaved(savedPosts.some((p) => p._id === post._id));
  }, [savedPosts, post._id]);
  return (
    <Reanimated.View
      entering={FadeIn.duration(250)}
      exiting={FadeOut.duration(250)}
      className={
        "h-fit flex w-11/12 bg-midnight_green/60 mt-4 p-4 rounded-2xl mx-auto "
      }
    >
      <View className="justify-between flex flex-row">
        <Text className="text-ivory  text-2xl font-bold mb-4">
          {post.title}
        </Text>
        {userType === UserType.DOCTOR && (
          <TouchableOpacity
            onPress={() => {
              setSaved(!s);
              savePost(post);
            }}
          >
            <Icons
              color={"#fbfff1"}
              name={s ? "bookmark-slash" : "bookmark"}
              size={40}
            />
          </TouchableOpacity>
        )}
      </View>
      <View
        className={
          "flex h-44 flex-row w-full mb-4 " +
          (post.images.length > 0 ? " gap-x-4" : "")
        }
      >
        <View
          className={
            " aspect-square relative rounded-xl overflow-hidden " +
            (post.images.length > 0 ? "w-6/12" : "w-0")
          }
        >
          <TouchableOpacity
            className="h-full"
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
              onLoadStart={() => setPictureLoading(post.images.length > 0)}
              onLoad={() => setPictureLoading(false)}
              className="h-full w-full rounded-xl"
              source={{ uri: post.images[0] }}
            />
            <View className="h-full w-full absolute top-0-z-10">
              <Skeleton
                boneColor={
                  colorScheme == "dark" ? "#041225" : "rgba(91, 149, 165, 0.1)"
                }
                highlightColor="#b4c5e4"
                layout={[
                  {
                    width: "100%",
                    height: "auto",
                    aspectRatio: 1 / 1,
                    position: "absolute",
                    top: 0,
                    zIndex: 50,
                  },
                ]}
                isLoading={pictureLoading}
              ></Skeleton>
            </View>
          </TouchableOpacity>
        </View>
        <View className={post.images.length > 0 ? "w-5/12" : "w-full"}>
          <Text className="text-ivory  font-medium overflow-ellipsis">
            {post.description}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        className="mt-6"
        onPress={() =>
          router.navigate({
            pathname: "/Post",
            params: { id: post._id?.toString() },
          })
        }
      >
        <View className="flex flex-row rounded-xl bg-powder_blue/30 p-1 px-2 justify-between">
          <Text className="text-ivory text-lg my-auto font-medium">
            {t("posts.commented", { number: post.comments.length })}
          </Text>
          <View className="-mb-1">
            <Icons color={"#fbfff1"} name="arrow-right" size={36} />
          </View>
        </View>
      </TouchableOpacity>
    </Reanimated.View>
  );
}
