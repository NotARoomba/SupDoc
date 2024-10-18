import { useColorScheme } from "nativewind";
import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function Loader() {
  // Shared values for strokeDashoffset and opacity
  const strokeDashoffset = useSharedValue(100);
  const opacity = useSharedValue(0);
  const {colorScheme} = useColorScheme();

  // Animate strokeDashoffset and opacity
  useEffect(() => {
    strokeDashoffset.value = withRepeat(
      withTiming(0, {
        duration: 1750,
        easing: Easing.inOut(Easing.ease),
      }),
      -1, // Infinite loop
      false, // Do not run backward
    );

    // Adjust the opacity to fade in and out, peaking at the middle
    opacity.value = withRepeat(
      withTiming(1, {
        duration: 875,
        easing: Easing.inOut(Easing.ease),
      }),
      -1, // Infinite loop
      false, // No reverse, allow a smooth peak and fade-out
    );
  }, []);

  // Animated props for strokeDashoffset and opacity
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: strokeDashoffset.value,
    opacity:
      opacity.value <= 0.5 ? opacity.value * 1.5 : (1 - opacity.value) * 1.5, // Peak opacity at 0.5 of the animation cycle
  }));

  return (
    <View className={`flex justify-center items-center w-24`}>
      <Svg
        scale={100}
        width="100%"
        height="50px"
        className="mx-auto"
        viewBox="0 0 50 31.25"
        preserveAspectRatio="xMidYMid meet"
      >
        <Path
          d="M0.625 21.5 h10.25 l3.75 -5.875 l7.375 15 l9.75 -30 l7.375 20.875 v0 h10.25"
          stroke={colorScheme == 'dark' ? "#fbfff1" : "#020912"}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.1}
        />
        <AnimatedPath
          d="M0.625 21.5 h10.25 l3.75 -5.875 l7.375 15 l9.75 -30 l7.375 20.875 v0 h10.25"
          stroke={colorScheme == 'dark' ? "#fbfff1" : "#020912"}
          strokeWidth="4"
          fill="none"
          strokeDasharray="100"
          animatedProps={animatedProps}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}
