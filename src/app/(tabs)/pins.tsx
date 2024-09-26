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
import LoaderView from "components/misc/LoaderView";
import PostBlock from "components/misc/PostBlock";

export default function Pins() {
  const { t } = useTranslation();
  const fadeAnim = useFade();
  // const {setLoading} = useLoading();
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const list = useRef<FlashList<Post> | null>(null);
  const fetchData = async () => {
    setLoading(true);
    console.log(`/doctors/saved/${posts.length == 0 ? 0 : posts[posts.length-1].timestamp}`)
    const res = await callAPI(
      `/doctors/saved/${posts.length == 0 ? 0 : posts[posts.length-1].timestamp}`,
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
        {posts.length == 0 ? (
            !loading ? (
              <View>
                <LoaderView />
              </View>
            ) : (
              <Text className=" text-center text-powder_blue/80">
                {t("posts.none")}
              </Text>
            )
          ) : <FlashList
          keyExtractor={(p) => {
            return p.timestamp.toString();
          }}
          ListFooterComponentStyle={{ height: 125 }}
          estimatedItemSize={281}
          data={posts}
          renderItem={({ item }) => (
            <PostBlock post={item} userType={UserType.DOCTOR} />
          )}
        />}
    </Animated.View>
  );
}
