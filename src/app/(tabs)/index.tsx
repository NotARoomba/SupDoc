import Post from "@/backend/models/post";
import { STATUS_CODES, UserType } from "@/backend/models/util";
import { FlashList } from "@shopify/flash-list";
import FunFact from "components/misc/FunFact";
import LoaderView from "components/misc/LoaderView";
import PostBlock from "components/misc/PostBlock";
import useFade from "components/misc/useFade";
import { callAPI, logout } from "components/utils/Functions";
// import SkeletonContent from 'react-native-reanimated-skeleton'
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
      `/${ut == UserType.DOCTOR ? "doctors" : "patients"}/posts/${ut == UserType.DOCTOR ? (posts.length == 0 ? 0 : posts[posts.length - 1].timestamp) : ""}`,
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
      {/* <SkeletonContent
      containerStyle={{ flex: 1 }}
      isLoading={loading}
      // layout={[
      //   { key: 'someId', width: 220, height: 20, marginBottom: 6 },
      //   { key: 'someOtherId', width: 180, height: 20, marginBottom: 6 }
      // ]}
    > */}
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
            {t("titles.feed")}
          </Text>
          {posts.length == 0 ? (
            !userType ? (
              // <View>
              <LoaderView />
            ) : (
              // </View>
              <Text className=" text-center text-powder_blue/80">
                {t("posts.feedNone")}
              </Text>
            )
          ) : (
            <FlashList
              keyExtractor={(p) => {
                return p.timestamp.toString();
              }}
              ListFooterComponentStyle={{ height: 125 }}
              estimatedItemSize={281}
              data={posts}
              renderItem={({ item }) => (
                <PostBlock post={item} userType={userType as UserType.DOCTOR} />
              )}
            />
          )}
        </View>
      )}
      {/* </SkeletonContent> */}
    </Animated.View>
  );
}
