import useFade from "components/hooks/useFade";
import { useSettings } from "components/hooks/useSettings";
import { useUser } from "components/hooks/useUser";
import { logout } from "components/utils/Functions";
import { LANGUAGES } from "components/utils/Types";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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
  const itemWidth = 256;
  const handleScrollEnd = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
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
      const scrollPosition = itemWidth * languageIndex;
      scrollX.value = scrollPosition;
      scrollRef.current?.scrollTo({ x: scrollPosition });
      setCurrentIndex(languageIndex);
    }
  }, [language, scrollRef.current]);

  const handleButtonPress = () => {
    if (!isConfirmDelete) {
      setIsConfirmDelete(true);
    } else {
      Alert.alert(t("buttons.deleteAccount"), t("buttons.deleteAccountDesc"), [
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
          (Platform.OS === "ios" ? "pt-16" : "pt-24")
        }
      >
        <View
          className={
            "absolute w-full p-4 flex justify-between z-50 flex-row " +
            (Platform.OS === "android" ? "top-7" : "")
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
          <TouchableOpacity
            disabled
            className="z-50 opacity-0 w-24 px-5 h-8 py-0 bg-midnight_green rounded-full"
            onPress={() =>
              Alert.alert(t("buttons.logout"), t("buttons.logoutDesc"), [
                { text: t("buttons.cancel"), style: "cancel" },
                {
                  text: t("buttons.logout"),
                  style: "destructive",
                  onPress: () => logout(),
                },
              ])
            }
          >
            <Text className="text-ivory h-fit font-bold text-center m-auto">
              {"titles.logout"}
            </Text>
          </TouchableOpacity>
        </View>
        <Text className="text-5xl text-ivory -mt-1 mx-auto font-bold">
          {t("titles.settings")}
        </Text>

        <View
          className={
            "m-auto " +
            (Platform.OS === "ios" ? "-translate-y-16" : "-translate-y-24")
          }
        >
          {/* <Text className="text-ivory text-3xl font-bold text-center mb-2">
            {t("buttons.theme")}
          </Text>
          <Slider
            options={[t("buttons.themes.dark"), t("buttons.themes.light")]}
            setOption={(v) =>
              setTheme(v == t("buttons.themes.dark") ? "dark" : "light")
            }
            selected={
              theme == "dark"
                ? t("buttons.themes.dark")
                : t("buttons.themes.light")
            }
          /> */}
          <Text className="text-ivory text-3xl font-bold text-center mt-8 mb-2">
            {t("settings.languages")}
          </Text>

          {/* ScrollView with snapping behavior */}
          <ScrollView
            horizontal
            ref={scrollRef}
            snapToOffsets={LANGUAGES.map((_, i) =>
              i == 0
                ? 0
                : i == LANGUAGES.length - 1
                  ? i * LANGUAGES.length - 1 - 80
                  : i * itemWidth,
            )}
            snapToAlignment="center"
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: 80 }}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScrollEnd}
            onScroll={handleScroll}
            // scrollEventThrottle={16}
            className="flex flex-row h-12 overflow-scroll"
          >
            {LANGUAGES.map((v, i) => {
              const animatedStyle = useAnimatedStyle(() => {
                const scale = withTiming(i === currentIndex ? 1.1 : 1, {
                  duration: 300,
                });
                const color = withTiming(
                  i === currentIndex ? "#023c4d" : "#082540",
                  {
                    duration: 300,
                  },
                );
                return { transform: [{ scale }], backgroundColor: color };
              });

              return (
                <Reanimated.View
                  key={i}
                  style={animatedStyle}
                  className={`snap-center mx-4 leading-10 transition-all duration-300 flex rounded-xl justify-center h-12 py-auto align-middle max-w-56 w-56 `}
                >
                  <Reanimated.Text className="text-center bg-transparent text-ivory text-2xl font-medium">
                    {v.name}
                  </Reanimated.Text>
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
