import Icons from "@expo/vector-icons/Octicons";
import { PostBlockProps } from "components/utils/Types";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import useFade from "./useFade";
import { UserType } from "@/backend/models/util";
import { BlurView } from 'expo-blur';
import { useState } from "react";
import Reanimated, { useAnimatedStyle, useSharedValue, withSpring, useAnimatedProps } from "react-native-reanimated";

export default function PostBlock({ post, userType, saved, blur }: PostBlockProps) {
  const fadeAnim = useFade();
  const { t } = useTranslation();
  const ReanimatedBlurView = Reanimated.createAnimatedComponent(BlurView);
  const blurIntensity = useSharedValue(50);
  const animatedBlurProps = useAnimatedProps(() => ({
    intensity: withSpring(blurIntensity.value, { damping: 15, stiffness: 90 }),
  }));

  const savePost = () => {
    console.log("save Post");
  };

  return (
    <Animated.View
      style={{ opacity: fadeAnim }}
      className={
        "h-fit flex w-11/12 bg-midnight_green-500/60 my-2 p-4 pt-0 gap-y-4 rounded-2xl mx-auto "
      }
    >
      <View className="justify-between flex flex-row">
        <Text className="text-ivory text-2xl font-bold">{post.title}</Text>
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
      <View className="flex h-44 flex-row w-full gap-x-4">
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
      <TouchableOpacity onPress={() => console.log("Navigate to big post Page")}>
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