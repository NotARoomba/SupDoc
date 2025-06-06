import React, { createRef, useEffect } from "react";
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  WithSpringConfig,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SliderProps } from "../utils/Types";

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
      className="flex flex-row mx-auto relative h-12 dark:bg-rich_black bg-paynes_gray/80 rounded-xl py-2"
    >
      <Animated.View
        className="-z-10 dark:bg-midnight_green bg-prussian_blue h-12 rounded-xl absolute left-0 "
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
              e.currentTarget.measure((_x, _y, w) => {
                pos.value = withSpring(w * i, springConfig);
                width.value = withSpring(w);
                setOption(v);
              });
            }}
            className="z-20"
          >
            <Text
              suppressHighlighting
              className="text-2xl font-semibold w-44 px-2 h-fit text-ivory text-center"
            >
              {v}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
