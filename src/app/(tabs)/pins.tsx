import { FlashList } from "@shopify/flash-list";
import useFade from "components/hooks/useFade";
import { useLoading } from "components/hooks/useLoading";
import { usePosts } from "components/hooks/usePosts";
import LoaderView from "components/loading/LoaderView";
import PostBlock from "components/misc/PostBlock";
import { UserType } from "components/utils/Types";
import { useTranslation } from "react-i18next";
import { Animated, Platform, Text, View } from "react-native";

export default function Pins() {
  const { t } = useTranslation();
  const fadeAnim = useFade();
  const { loading } = useLoading();
  const { savedPosts, listRef } = usePosts();
  // const listRef = useRef<FlashList<Post> | null>(null);
  // const fetchData = async () => {

  //   list.current?.prepareForLayoutAnimationRender();
  //   // After removing the item, we can start the animation.
  //   LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  // };
  // useEffect(() => {
  //   fetchData();
  // }, []);
  // useFocusEffect(
  //   useCallback(() => {
  //    fetchData();
  //   }, []),
  // );
  return (
    <Animated.View
      style={{ opacity: fadeAnim }}
      className={"h-full " + (Platform.OS == "ios" ? "pt-6" : "pt-16")}
    >
      <Text className="text-6xl font-bold text-center text-ivory">
        {t("titles.pins")}
      </Text>
      {savedPosts.length == 0 ? (
        loading ? (
          <View className="h-fit">
            <LoaderView />
          </View>
        ) : (
          <Text className=" text-center text-powder_blue/80">
            {t("posts.savedNone")}
          </Text>
        )
      ) : (
        <FlashList
          keyExtractor={(p, i) => `${i}-${p._id?.toString()}`}
          ListFooterComponentStyle={{ height: 125 }}
          estimatedItemSize={281}
          data={savedPosts}
          renderItem={({ item }) => (
            <PostBlock
              post={item}
              listRef={listRef}
              saved
              userType={UserType.DOCTOR}
            />
          )}
        />
      )}
    </Animated.View>
  );
}
