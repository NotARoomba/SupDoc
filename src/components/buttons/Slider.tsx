import {
  Button,
  GestureResponderEvent,
  LayoutChangeEvent,
  Pressable,
  Touchable,
  TouchableHighlight,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { SliderProps } from "../utils/Types";
import Animated, { useSharedValue, withSpring } from "react-native-reanimated";
import { createRef, useEffect, useState } from "react";
import { SpringConfig } from "react-native-reanimated/lib/typescript/reanimated2/animation/springUtils";

export default function Slider({ options, setOption, selected }: SliderProps) {
  const pos = useSharedValue(0);
  const width = useSharedValue(100);
  const springConfig: SpringConfig = {
    mass: 1,
    stiffness: 100,
    damping: 20,
  };
  // const objectWidth = width/options.length
  const firstRef = createRef<TouchableHighlight>();
  return (
    <View className="flex flex-row mx-auto relative h-12 bg-rich_black rounded-xl py-2">
      <Animated.View
        className="-z-10 bg-midnight_green h-12 rounded-xl absolute left-0 "
        style={{ width: width, transform: [{ translateX: pos }] }}
      />
      {options.map((v, i) => (
        <TouchableOpacity
          activeOpacity={1}
          key={i}
          onLayout={
            (i == 0 && !selected) || selected == v
              ? (e: LayoutChangeEvent) => {
                  setOption(v);
                  e.target.measure((x, __, w) => {
                    width.value = withSpring(w);
                    pos.value = withSpring(x, springConfig);
                  });
                }
              : undefined
          }
          onPress={(e: GestureResponderEvent) => {
            e.currentTarget.measure((x, _, w) => {
              pos.value = withSpring(x, springConfig);
              width.value = withSpring(w);
              setOption(v);
            });
          }}
          className="z-20"
        >
          <Text
            suppressHighlighting
            className="text-2xl px-12 h-fit text-ivory"
          >
            {v}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
