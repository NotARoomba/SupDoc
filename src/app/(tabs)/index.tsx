import Post from "@/backend/models/post";
import { STATUS_CODES, UserType } from "@/backend/models/util";
import { FlashList } from "@shopify/flash-list";
import FunFact from "components/misc/FunFact";
import Loader from "components/misc/Loader";
import PostBlock from "components/misc/PostBlock";
import useFade from "components/misc/useFade";
import { callAPI, logout } from "components/utils/Functions";
import { SplashScreen, useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Animated,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
export default function Index() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [userType, setUserType] = useState<UserType>(UserType.PATIENT);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useFade();
  const { t } = useTranslation();
  const fetchData = async () => {
    setLoading(true);
    const ut = (await SecureStore.getItemAsync(
      process.env.EXPO_PUBLIC_KEY_NAME_TYPE,
    )) as UserType;
    setUserType(ut);
    const res = await callAPI(
      `/${ut == UserType.DOCTOR ? t("doctors") : t("patients")}/posts`,
      "GET",
    );
    if (res.status !== STATUS_CODES.SUCCESS)
      return res.status == STATUS_CODES.UNAUTHORIZED
        ? await logout()
        : Alert.alert(t("error"), t(STATUS_CODES[res.status]));
    setPosts(res.posts);
    console.log(res.posts.length);
    setLoading(false);
    await SplashScreen.hideAsync();
  };
  // REPLACE WITH WEBHOOK
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <Animated.View
      style={{ opacity: fadeAnim }}
      className={"h-full " + (Platform.OS == "ios" ? "pt-6" : "pt-16")}
    >
      {userType == UserType.PATIENT ? (
        <ScrollView className="h-full flex">
          <FunFact />
          <View className="h-0.5 rounded-full w-11/12 mx-auto bg-powder_blue/50 my-4" />
          <Text className="text-4xl font-bold text-center text-ivory">
            {t("titles.posts")}
          </Text>
          {posts.length == 0 ? (
            <Text className=" text-center text-powder_blue/80">
              {t("posts.none")}
            </Text>
          ) : (
            <View className="flex">
              <View className="h-8" />
              {posts.map((v, i) => (
                <PostBlock key={i} post={v} userType={userType} />
              ))}
              <View className="h-32" />
            </View>
          )}
        </ScrollView>
      ) : (
        <View className="h-full">
          <Text className="text-6xl font-bold text-center text-ivory">
            {t("posts.posts")}
          </Text>
          <FlashList
            estimatedItemSize={70}
            data={posts}
            renderItem={({ item }) => (
              <Text className="text-6xl font-medium text-ivory">
                {item.title}
              </Text>
            )}
            className="h-full"
          />
        </View>
      )}
      <Spinner
        visible={loading}
        overlayColor="#00000099"
        textContent={"Loading"}
        customIndicator={<Loader />}
        textStyle={{ color: "#fff", marginTop: -25 }}
        animation="fade"
      />
    </Animated.View>
  );
}
