import Post from "@/backend/models/post";
import { STATUS_CODES, UserType } from "@/backend/models/util";
import { FlashList } from "@shopify/flash-list";
import FunFact from "components/misc/FunFact";
import LoaderView from "components/misc/LoaderView";
import PostBlock from "components/misc/PostBlock";
import useFade from "components/misc/useFade";
import { callAPI, logout } from "components/utils/Functions";
import {
  SplashScreen,
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Animated,
  LayoutAnimation,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
export default function Index() {
  const [posts, setPosts] = useState<Post[]>([]);
  const list = useRef<FlashList<Post> | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  // const [loading, setLoading] = useState(false);
  const fadeAnim = useFade();
  const { t } = useTranslation();
  const routes = useLocalSearchParams();
  const fetchData = async () => {
    // setLoading(true);
    const ut = (await SecureStore.getItemAsync(
      process.env.EXPO_PUBLIC_KEY_NAME_TYPE,
    )) as UserType;
    const res = await callAPI(
      `/${ut == UserType.DOCTOR ? t("doctors") : t("patients")}/posts`,
      "GET",
    );
    if (res.status !== STATUS_CODES.SUCCESS)
      return res.status == STATUS_CODES.UNAUTHORIZED
        ? await logout()
        : Alert.alert(t("error"), t(STATUS_CODES[res.status]));
    setPosts(res.posts);
    setUserType(ut);
    // setLoading(false);
    list.current?.prepareForLayoutAnimationRender();
    // After removing the item, we can start the animation.
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    await SplashScreen.hideAsync();
  };
  // REPLACE WITH WEBHOOK
  useFocusEffect(
    useCallback(() => {
      if (routes.refresh) {
        fetchData();
        router.setParams({});
        router.navigate({ pathname: "/(tabs)/", params: { refresh: null } });
      }
    }, [routes]),
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
            !userType ? (
              <View>
                <LoaderView />
              </View>
            ) : (
              <Text className=" text-center text-powder_blue/80">
                {t("posts.none")}
              </Text>
            )
          ) : (
            //https://shopify.github.io/flash-list/docs/guides/layout-animation/
            <FlashList
              keyExtractor={(p) => {
                return p.timestamp.toString();
              }}
              ListFooterComponentStyle={{ height: 125 }}
              estimatedItemSize={281}
              data={posts}
              renderItem={({ item }) => (
                <PostBlock post={item} userType={userType} />
              )}
            />
          )}
        </ScrollView>
      ) : (
        <View className="h-full">
          <Text className="text-6xl font-bold text-center text-ivory">
            {t("posts.posts")}
          </Text>
          <FlashList
            estimatedItemSize={313}
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
    </Animated.View>
  );
}
