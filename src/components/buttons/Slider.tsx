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
import { WithSpringConfig } from "react-native-reanimated";
import React from "react";

export default function Slider({ options, setOption, selected }: SliderProps) {
  const pos = useSharedValue(0);
  const width = useSharedValue(0);
  const buttonsRef = createRef<View>();
  const springConfig: WithSpringConfig = {
    mass: 1,
    stiffness: 100,
    damping: 20,
  };
  // const objectWidth = width/options.length
  const firstRef = createRef<TouchableHighlight>();
  useEffect(() => {
    if (!selected) {
      width.value = 0;
    }
  }, [selected]);
  return (
    <View
      collapsable={false}
      className="flex flex-row mx-auto relative h-12 bg-rich_black rounded-xl py-2"
    >
      <Animated.View
        className="-z-10 bg-midnight_green h-12 rounded-xl absolute left-0 "
        style={{ width: width, transform: [{ translateX: pos }] }}
      />
      <View
        className={
          "flex flex-row transition-all duration-500 " +
          (!selected && " divide-x-2 divide-powder_blue/40")
        }
        ref={buttonsRef}
        collapsable={false}
      >
        {options.map((v, i) => (
          <TouchableOpacity
            activeOpacity={1}
            key={i}
            onLayout={
              /* (i == 0 && !selected) || */ selected == v
                ? (e: LayoutChangeEvent) => {
                    setOption(v);
                    const layout = e.nativeEvent.layout;
                    width.value = withSpring(layout.width);
                    pos.value = withSpring(layout.x, springConfig);
                  }
                : undefined
            }
            onPress={(e: GestureResponderEvent) => {
              e.currentTarget.measure((_x, __, w, _h, x) => {
                pos.value = withSpring(x - 32, springConfig);
                width.value = withSpring(w);
                setOption(v);
              });
            }}
            className="z-20"
          >
            <Text
              suppressHighlighting
              className="text-2xl font-semibold w-44 px-12 h-fit text-ivory text-center"
            >
              {v}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
