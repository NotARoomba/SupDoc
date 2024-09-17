import { useIsFocused } from "@react-navigation/native";
import { useCallback, useEffect, useRef } from "react";
import { Animated } from "react-native";

export default function useFade() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const focused = useIsFocused();
  const fadeIn = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim]);
  const fadeOut = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim]);
  useEffect(() => {
    if (focused) fadeIn();
    else fadeOut();
  }, [focused]);
  return fadeAnim;
}
