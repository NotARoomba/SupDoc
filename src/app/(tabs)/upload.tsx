import { useIsFocused } from "@react-navigation/native";
import useFade from "components/misc/useFade";
import { useRef, useCallback, useEffect } from "react";
import { View, Text, Animated } from "react-native";

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
