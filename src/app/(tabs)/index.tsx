import { UserType } from "@/backend/models/util";
import { FlashList } from "@shopify/flash-list";
import useFade from "components/hooks/useFade";
import { usePosts } from "components/hooks/usePosts";
import { useUser } from "components/hooks/useUser";
import FunFact from "components/misc/FunFact";
import PostBlock from "components/misc/PostBlock";
// import SkeletonContent from 'react-native-reanimated-skeleton'
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import Skeleton from "react-native-reanimated-skeleton";
export default function Index() {
  const { posts, listRef, fetchPosts, refreshPosts, facts, feed } = usePosts();
  // const listRef = useRef<FlashList<Post> | null>(null);
  const { userType, user } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useFade();
  const { t } = useTranslation();
  // const fetchData = async () => {
  //   listRef.current?.prepareForLayoutAnimationRender();
  //   // After removing the item, we can start the animation.
  //   LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  //   await SplashScreen.hideAsync();
  // };
  useEffect(() => {
    if (feed.length !== 0 || posts.length !== 0) setLoading(false);
  }, [feed, posts]);
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
          <RefreshControl
            enabled
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              refreshPosts().then(() => setRefreshing(false));
            }}
          />
          <FunFact fact={facts[0]} />
          <View className="h-0.5 rounded-full w-11/12 mx-auto bg-powder_blue/50 my-4" />
          <Text className="text-4xl font-bold text-center text-ivory">
            {t("titles.userPosts")}
          </Text>
          {posts.length == 0 ? (
            loading ? (
              // <View>
              //   <LoaderView />
              // </View>
              Array(2)
                .fill(0)
                .map((_, i) => (
                  <Skeleton
                    isLoading={loading}
                    key={i}
                    boneColor="#023c4d"
                    highlightColor="#b4c5e4"
                    containerStyle={{
                      height: 300,
                      padding: 16,
                      rowGap: 16,
                      marginTop: 16,
                      marginHorizontal: "auto",
                      width: "92%",
                      backgroundColor: "rgba(2, 60, 77, 0.6)",
                      borderRadius: 16,
                    }}
                    layout={[
                      { width: `80%`, height: 32, borderRadius: 8 },
                      { display: "flex", width: "95%", height: 164 },
                      {
                        width: `100%`,
                        height: 32,
                        borderRadius: 8,
                        marginHorizontal: "auto",
                      },
                    ]}
                  />
                ))
            ) : (
              <Text className=" text-center text-powder_blue/80">
                {t("posts.none")}
              </Text>
            )
          ) : (
            //https://shopify.github.io/flash-list/docs/guides/layout-animation/
            <FlashList
              ref={listRef}
              keyExtractor={(p, i) => `${i}-${p._id?.toString()}`}
              ListFooterComponentStyle={{ height: 125 }}
              estimatedItemSize={281}
              data={posts}
              renderItem={({ item }) => (
                <PostBlock post={item} listRef={listRef} userType={userType} />
              )}
            />
          )}
        </ScrollView>
      ) : (
        <ScrollView className="h-full flex">
          <RefreshControl
            enabled
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              refreshPosts().then(() => setRefreshing(false));
            }}
          />
          <Text className="text-6xl font-bold text-center text-ivory">
            {t("titles.feed")}
          </Text>
          {feed.length == 0 ? (
            loading ? (
              // <View>
              Array(2)
                .fill(0)
                .map((_, i) => (
                  <Skeleton
                    isLoading={loading}
                    key={i}
                    boneColor="#023c4d"
                    highlightColor="#b4c5e4"
                    containerStyle={{
                      height: 300,
                      padding: 16,
                      rowGap: 16,
                      marginTop: 16,
                      marginHorizontal: "auto",
                      width: "92%",
                      backgroundColor: "rgba(2, 60, 77, 0.6)",
                      borderRadius: 16,
                    }}
                    layout={[
                      { width: `80%`, height: 32, borderRadius: 8 },
                      { display: "flex", width: "95%", height: 164 },
                      {
                        width: `100%`,
                        height: 32,
                        borderRadius: 8,
                        marginHorizontal: "auto",
                      },
                    ]}
                  />
                ))
            ) : (
              // </View>
              <Text className=" text-center text-powder_blue/80">
                {t("posts.feedNone")}
              </Text>
            )
          ) : (
            <FlashList
              // ref={listRef as unknown as MutableRefObject<FlashList<Post> | null>}
              keyExtractor={(p, i) => `${i}-${p._id?.toString()}`}
              ListFooterComponentStyle={{ height: 125 }}
              estimatedItemSize={281}
              onEndReached={() => fetchPosts()}
              data={feed}
              renderItem={({ item }) =>
                "likes" in item ? (
                  <FunFact fact={item} />
                ) : (
                  <PostBlock
                    post={item}
                    listRef={listRef}
                    userType={userType as UserType.DOCTOR}
                  />
                )
              }
            />
          )}
        </ScrollView>
      )}
      {/* </SkeletonContent> */}
    </Animated.View>
  );
}
