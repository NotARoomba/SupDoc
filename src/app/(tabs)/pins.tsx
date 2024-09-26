import useFade from "components/misc/useFade";
import { useLoading } from "components/misc/useLoading";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Animated, LayoutAnimation, Platform, Text, View } from "react-native";
import * as SecureStore from 'expo-secure-store'
import { STATUS_CODES } from "@/backend/models/util";
import { callAPI, logout } from "components/utils/Functions";
import { UserType } from "components/utils/Types";
import { SplashScreen } from "expo-router";
import Post from "@/backend/models/post";
import { FlashList } from "@shopify/flash-list";

export default function Pins() {
  const { t } = useTranslation();
  const fadeAnim = useFade();
  const {setLoading} = useLoading();
  const [posts, setPosts] = useState<Post[]>([]);
  const list = useRef<FlashList<Post> | null>(null);
  const fetchData = async () => {
    setLoading(true);
    const ut = (await SecureStore.getItemAsync(
      process.env.EXPO_PUBLIC_KEY_NAME_TYPE,
    )) as UserType;
    const res = await callAPI(
      `/${ut == UserType.DOCTOR ? "doctors" : "patients"}/posts/${posts.length == 0 ? 0 : posts[posts.length-1].timestamp}`,
      "GET",
    );
    if (res.status !== STATUS_CODES.SUCCESS)
      return res.status == STATUS_CODES.UNAUTHORIZED
        ? await logout()
        : Alert.alert(t("error"), t(STATUS_CODES[res.status]));
    setPosts(res.posts);
    setLoading(false);
    list.current?.prepareForLayoutAnimationRender();
    // After removing the item, we can start the animation.
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    await SplashScreen.hideAsync();
  };
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <Animated.View style={{ opacity: fadeAnim }} className={"h-full " + (Platform.OS == "ios" ? "pt-6" : "pt-16")}>
        <Text className="text-6xl font-bold text-center text-ivory">{t("titles.pins")}</Text>
    </Animated.View>
  );
}
