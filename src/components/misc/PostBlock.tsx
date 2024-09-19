import { PostBlockProps } from "components/utils/Types";
import { useTranslation } from "react-i18next";
import { Animated, Platform, Text, View } from "react-native";
import useFade from "./useFade";

export default function PostBlock({ post }: PostBlockProps) {
  const fadeAnim = useFade();
  const { t } = useTranslation();
  return (<Animated.View
      style={{ opacity: fadeAnim }}
      className={"h-fit pt-6 mx-auto " + (Platform.OS == "ios" ? "pt-6" : "pt-16")}
    ><View><Text className="text-ivory text-6xl">{post.title}</Text></View></Animated.View>
  );
}
