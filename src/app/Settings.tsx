import Slider from "components/buttons/Slider";
import useFade from "components/hooks/useFade";
import { useSettings } from "components/hooks/useSettings";
import { useUser } from "components/hooks/useUser";
import { logout } from "components/utils/Functions";
import { LANGUAGES } from "components/utils/Types";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Animated,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Reanimated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export default function Settings() {
  const fadeAnim = useFade();
  const { setLanguage, setTheme, theme, language } = useSettings();
  const { deleteUser } = useUser();
  const { t } = useTranslation();
  const scrollX = useSharedValue(0);
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);
  const handleScrollEnd = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const itemWidth = 256;
    const index = Math.round(contentOffsetX / itemWidth);
    setCurrentIndex(index);
    setLanguage(LANGUAGES[index].locale);
  };

  const handleScroll = (event: any) => {
    scrollX.value = event.nativeEvent.contentOffset.x;
  };

  useEffect(() => {
    const languageIndex = LANGUAGES.findIndex((v) => v.locale === language);
    if (languageIndex !== -1 && scrollRef.current) {
      const scrollPosition = 256 * languageIndex;
      scrollRef.current.scrollTo({ x: scrollPosition, animated: false });
      scrollX.value = scrollPosition;
      setCurrentIndex(languageIndex);
    }
  }, [language, scrollRef.current]);

  const colorPalette = ["#124081", "#082540", "#071932", "#12528e"];

  const colors = useMemo(() => {
    return LANGUAGES.map(() => {
      const randomColorIndex = Math.floor(Math.random() * colorPalette.length);
      return colorPalette[randomColorIndex];
    });
  }, []);

  const handleButtonPress = () => {
    if (!isConfirmDelete) {
      setIsConfirmDelete(true);
    } else {
      Alert.alert("Logout", "Are you sure you want to delete your account?", [
        {
          text: t("buttons.cancel"),
          style: "cancel",
          onPress: () => setIsConfirmDelete(false),
        },
        {
          text: t("buttons.delete"),
          style: "destructive",
          onPress: deleteUser,
        },
      ]);
      setIsConfirmDelete(false);
    }
  };

  const buttonStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isConfirmDelete ? 1 : 1, { duration: 300 }),
      backgroundColor: isConfirmDelete ? "#f87171" : "#808080",
    };
  });

  return (
    <View className="h-full">
      <SafeAreaView className="bg-richer_black" />
      <Animated.View
        style={{ opacity: fadeAnim }}
        className={
          "h-full bg-richer_black red relative " +
          (Platform.OS == "ios" ? "pt-16" : "pt-24")
        }
      >
        <View
          className={
            "absolute w-full p-4 flex justify-between z-50 flex-row " +
            (Platform.OS == "android" ? "top-7" : "")
          }
        >
          <TouchableOpacity
            onPress={router.back}
            className="z-50 w-24 px-5 h-8 py-0 bg-ivory/20 rounded-full"
          >
            <Reanimated.Text className="text-ivory h-fit text font-bold text-center m-auto">
              {t("buttons.back")}
            </Reanimated.Text>
          </TouchableOpacity>
          <Text className="text-4xl text-ivory -mt-1 mx-auto font-bold">
            {t("titles.settings")}
          </Text>
          <TouchableOpacity
            disabled
            className="z-50 opacity-0 w-24 px-5 h-8 py-0 bg-midnight_green rounded-full"
            onPress={() =>
              Alert.alert(
                t("buttons.logout"),
                "Are you sure you want to logout?",
                [
                  { text: t("buttons.cancel"), style: "cancel" },
                  {
                    text: t("buttons.logout"),
                    style: "destructive",
                    onPress: () => logout(),
                  },
                ],
              )
            }
          >
            <Text className="text-ivory h-fit font-bold text-center m-auto">
              {"titles.logout"}
            </Text>
          </TouchableOpacity>
        </View>

        <View
          className={
            "m-auto " +
            (Platform.OS == "ios" ? "-translate-y-16" : "-translate-y-24")
          }
        >
          <Text className="text-ivory text-3xl font-bold text-center mb-2">
            {t("buttons.theme")}
          </Text>
          <Slider
            options={[t("buttons.themes.dark"), t("buttons.themes.light")]}
            setOption={(v) => setTheme(v.toLowerCase() as any)}
            selected={
              theme
                ? theme.charAt(0).toUpperCase() + theme.slice(1)
                : t("buttons.themes.dark")
            }
          />
          <Text className="text-ivory text-3xl font-bold text-center mt-8 mb-2">
            {t("settings.languages")}
          </Text>

          {/* ScrollView with snapping behavior */}
          <ScrollView
            horizontal
            ref={scrollRef}
            snapToInterval={256}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 80 }}
            onMomentumScrollEnd={handleScrollEnd}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            className="flex flex-row h-12 overflow-scroll no-scrollbar"
          >
            {LANGUAGES.map((v, i) => {
              const animatedStyle = useAnimatedStyle(() => {
                const inputRange = [(i - 1) * 256, i * 256, (i + 1) * 256];
                const backgroundColor = interpolateColor(
                  scrollX.value,
                  inputRange,
                  [
                    colors[i % colors.length],
                    colors[(i + 1) % colors.length],
                    colors[(i + 2) % colors.length],
                  ],
                );
                const opacity = withTiming(i === currentIndex ? 1 : 1, {
                  duration: 300,
                });
                const scale = withTiming(i === currentIndex ? 1.1 : 1, {
                  duration: 300,
                });
                return { backgroundColor, opacity, transform: [{ scale }] };
              });

              return (
                <Reanimated.View
                  key={i}
                  style={animatedStyle}
                  className={`snap-center mx-4 leading-10 transition-all duration-300 flex rounded-xl justify-center h-12 py-auto align-middle w-56`}
                >
                  <Text className="text-center text-2xl font-medium text-ivory">
                    {v.name}
                  </Text>
                </Reanimated.View>
              );
            })}
          </ScrollView>
          <Text className="text-ivory text-3xl font-bold text-center mt-8 mb-2">
            {t("settings.danger")}
          </Text>

          {/* Double-click button */}
          <Reanimated.View
            style={[buttonStyle]}
            className="mx-auto leading-10 flex rounded-xl justify-center h-12 align-middle w-56"
          >
            <TouchableOpacity onPress={handleButtonPress}>
              <Text className="text-center text-2xl font-medium text-ivory">
                {isConfirmDelete
                  ? t("settings.confirmDelete")
                  : t("settings.deleteAccount")}
              </Text>
            </TouchableOpacity>
          </Reanimated.View>
        </View>
      </Animated.View>
      <Reanimated.View className="w-full absolute bottom-6">
        <Text className=" text-powder_blue/50 font-bold text-center text-xs w-11/12 mx-auto">
          {t("settings.credits")}
        </Text>
      </Reanimated.View>
    </View>
  );
}
