import LanguageButton from "components/buttons/LanguageButton";
import Slider from "components/buttons/Slider";
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
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Reanimated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

export default function Settings() {
  const fadeAnim = useFade();
  const { setLanguage, setTheme, theme, language } = useSettings();
  const { deleteUser } = useUser();
  const { t } = useTranslation();
  const scrollRef = useRef<ScrollView>(null);
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);
  const itemWidth = 224;
  const handleScrollEnd = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / itemWidth);
    setLanguage(LANGUAGES[index].locale);
  };

  useEffect(() => {
    const languageIndex = LANGUAGES.findIndex((v) => v.locale === language);
    if (languageIndex !== -1 && scrollRef.current) {
      const scrollPosition = itemWidth * languageIndex;
      setTimeout(() => scrollRef.current?.scrollTo({ x: scrollPosition }), 100);
    }
  }, [scrollRef.current, fadeAnim]);

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
      <SafeAreaView className="dark:bg-richer_black bg-ivory" />
      <Animated.View
        style={{ opacity: fadeAnim }}
        className={
          "h-full dark:bg-richer_black bg-ivory red relative " +
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
            className="z-50 w-24 px-5 h-8 py-0 dark:bg-ivory/20 bg-blue_munsell rounded-full"
          >
            <Reanimated.Text className="text-ivory  h-fit text font-bold text-center m-auto">
              {t("buttons.back")}
            </Reanimated.Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled
            className="z-50 opacity-0 w-24 px-5 h-8 py-0 dark:bg-midnight_green bg-prussian_blue rounded-full"
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
            <Text className="dark:text-ivory text-richer_black h-fit font-bold text-center m-auto">
              {"titles.logout"}
            </Text>
          </TouchableOpacity>
        </View>
        <Text className="text-5xl dark:text-ivory text-richer_black -mt-1 mx-auto font-bold">
          {t("titles.settings")}
        </Text>

        <View
          className={
            "m-auto " +
            (Platform.OS === "ios" ? "-translate-y-16" : "-translate-y-24")
          }
        >
          <Text className="dark:text-ivory text-richer_black text-3xl font-bold text-center mb-2">
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
          />
          <Text className="dark:text-ivory text-richer_black text-3xl font-bold text-center mt-8 mb-2">
            {t("settings.languages")}
          </Text>

          {/* ScrollView with snapping behavior */}
          <ScrollView
            horizontal
            ref={scrollRef}
            snapToAlignment="start"
            decelerationRate={"fast"}
            snapToInterval={224}
            contentContainerStyle={{
              paddingHorizontal: Dimensions.get("window").width / 2 - 224 / 2,
            }}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScrollEnd}
            // scrollEventThrottle={16}
            className="flex flex-row h-12 overflow-scroll"
          >
            {LANGUAGES.map((v, i) => (
              <LanguageButton
                key={i}
                index={i}
                language={v}
                currentIndex={-1}
              />
            ))}
          </ScrollView>
          <Text className="dark:text-ivory text-richer_black text-3xl font-bold text-center mt-8 mb-2">
            {t("settings.danger")}
          </Text>

          {/* Double-click button */}
          <Reanimated.View
            style={[buttonStyle]}
            className="mx-auto leading-10 flex rounded-xl justify-center h-12 align-middle w-56"
          >
            <TouchableOpacity onPress={handleButtonPress}>
              <Text className="text-center text-2xl font-medium dark:text-ivory text-richer_black">
                {isConfirmDelete
                  ? t("settings.confirmDelete")
                  : t("settings.deleteAccount")}
              </Text>
            </TouchableOpacity>
          </Reanimated.View>
        </View>
      </Animated.View>
      <Reanimated.View className="w-full absolute bottom-6">
        <Text className=" dark:text-powder_blue/50 text-oxford_blue/50 font-bold text-center text-xs w-11/12 mx-auto">
          {t("settings.credits")}
        </Text>
      </Reanimated.View>
    </View>
  );
}
