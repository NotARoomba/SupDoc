import useFade from "components/misc/useFade";
import { Animated, Text } from "react-native";

export default function Upload() {
  const fadeAnim = useFade();
  return (
    <Animated.View style={{ opacity: fadeAnim }} className="flex h-full pt-4">
      <Text className="text-4xl text-ivory mx-auto font-semibold">
        New Post
      </Text>
    </Animated.View>
  );
}
