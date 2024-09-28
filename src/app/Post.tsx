import Comment from "@/backend/models/comment";
import Post from "@/backend/models/post";
import { STATUS_CODES, UserType } from "@/backend/models/util";
import Icons from "@expo/vector-icons/Octicons";
import prompt from "@powerdesigninc/react-native-prompt";
import useFade from "components/hooks/useFade";
import { usePosts } from "components/hooks/usePosts";
import { useUser } from "components/hooks/useUser";
import Loader from "components/loading/Loader";
import LoaderView from "components/loading/LoaderView";
import CommentBlock from "components/misc/CommentBlock";
import { callAPI } from "components/utils/Functions";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Animated,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Gallery, { GalleryRef } from "react-native-awesome-gallery";
import Spinner from "react-native-loading-spinner-overlay";
import Reanimated, { FadeIn, FadeOut } from "react-native-reanimated";
import Skeleton from "react-native-reanimated-skeleton";

export default function PostPage() {
  const routes = useLocalSearchParams();
  const fadeAnim = useFade();
  const { userType } = useUser();
  const { deletePost, reportPost } = usePosts();
  const [post, setPost] = useState<Post>();
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const galleryRef = useRef<GalleryRef>(null);
  const [index, setIndex] = useState(0);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      const res = await callAPI(`/posts/${routes.id}`, "GET");
      if (res.status !== STATUS_CODES.SUCCESS) {
        router.navigate("/(tabs)");
        return Alert.alert(t("error"), t(`${STATUS_CODES[res.status]}`));
      }
      setPost(res.post);
    };
    fetchData();
  }, []);
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "position" : "position"}
      style={{ flex: 1 }}
      // keyboardVerticalOffset={Platform.OS === "ios" ? 120 : 0}
    >
      <SafeAreaView className="bg-richer_black" />
      <Animated.View
        style={{ opacity: fadeAnim }}
        className={
          "h-full bg-richer_black relative " +
          (Platform.OS == "ios" ? "pt-16" : "pt-24")
        }
      >
        <View
          className={
            " absolute w-full p-4 flex justify-between z-50 flex-row " +
            (Platform.OS == "android" ? "top-7" : "")
          }
        >
          <TouchableOpacity
            onPress={() => (keyboardOpen ? Keyboard.dismiss() : router.back())}
            className="z-50 w-24  px-5 h-8 py-0 bg-ivory/20 rounded-full"
          >
            <Reanimated.Text
              key={keyboardOpen ? "a" : "b"}
              entering={FadeIn.duration(250)}
              exiting={FadeOut.duration(250)}
              className="text-ivory h-fit  text font-bold text-center m-auto"
            >
              {keyboardOpen ? "Cancel" : "Back"}
            </Reanimated.Text>
          </TouchableOpacity>
          {/* <Text className="text-4xl text-ivory -mt-1 mx-auto font-bold">
          Post
        </Text> */}
          <TouchableOpacity
            className="z-50  w-24 px-5  h-8 py-0 bg-midnight_green rounded-full"
            onPress={() =>
              Alert.alert(
                    "Confirm",
                    `Are you sure you want to ${userType == UserType.DOCTOR ? "report" : "delete"} the post?`,
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: userType == UserType.DOCTOR ? "Report" : "Delete",
                        style: "destructive",
                        onPress: () => userType == UserType.DOCTOR ? reportPost(routes.id as string):deletePost(routes.id as string) ,
                      },
                    ],
                  )
            }
          >
            {/* <Icons name="sign-out" size={38} color={"#fbfff1"} /> */}
            <Text className="text-ivory h-fit font-bold text-center m-auto">
              {userType == UserType.DOCTOR ? "Report" : "Delete"}
            </Text>
          </TouchableOpacity>
        </View>
        {post ? (
          <Reanimated.ScrollView
            entering={FadeIn.duration(500)}
            exiting={FadeOut.duration(500)}
            className="h-full z-10 w-full"
          >
            <Text className="text-ivory w-11/12 text-left text-4xl mx-auto font-bold ">
              {post.title}
            </Text>
            {post.images.length > 0 && (
              <View className="flex relative w-11/12 aspect-square my-4 mx-auto">
                {/* <Reanimated.ScrollView
            centerContent
            horizontal
            entering={FadeIn.duration(500)}
            // exiting={FadeOut.duration(0)}
            contentContainerStyle={{ justifyContent: "space-between" }}
            className={"flex flex-row mt-4 static " + (expanded != -1 ? "h-full" : "")}
            // style={{ width: Dimensions.get("window").width }}
          >{post.images.map((v, i) => <TouchableOpacity
            // exiting={FadeOut.duration(500)}
            key={i}
            onPress={() => setExpanded(i == expanded ? -1 : i)}
            className={" flex aspect-square border border-solid border-ivory/80 rounded-xl " + (expanded != i ? "w-64 my-auto mx-2 h-64" : " w-screen aspect-square absolute top-0 z-50")}
          >
            <Image  source={{uri: v}} className=" z-50 aspect-square rounded-xl" /></TouchableOpacity>)}</Reanimated.ScrollView> */}
                <Gallery
                  ref={galleryRef}
                  containerDimensions={{
                    width: Dimensions.get("window").width * (11 / 12),
                    height: Dimensions.get("window").width * (11 / 12),
                  }}
                  renderItem={(v) => {
                    const [pictureLoading, setPictureLoading] = useState(false);
                    return (
                      <View className="h-full w-full">
                        <Image
                          className="h-full w-full"
                          onLoadStart={() => setPictureLoading(true)}
                          onLoad={() => setPictureLoading(false)}
                          source={v.item}
                        />
                        <View className="h-full w-full absolute top-0-z-10">
                          <Skeleton
                            // animationType="pulse"
                            boneColor="#041225"
                            highlightColor="#b4c5e410"
                            animationDirection="diagonalDownRight"
                            layout={[
                              {
                                width: "100%",
                                height: "auto",
                                aspectRatio: 1 / 1,
                                position: "absolute",
                                top: 0,
                                zIndex: 50,
                              },
                            ]}
                            isLoading={pictureLoading}
                          ></Skeleton>
                        </View>
                      </View>
                    );
                  }}
                  onIndexChange={(i) => setIndex(i)}
                  data={post.images}
                />
                <TouchableOpacity
                  disabled={index == 0}
                  className={
                    "absolute top-1/2 -translate-y-5 left-4 transition-opacity duration-300" +
                    (index == 0 ? " opacity-0" : " opacity-100")
                  }
                  onPress={() => galleryRef.current?.setIndex(index - 1, true)}
                >
                  <Icons name="chevron-left" size={40} color="#fbfff1" />
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={index == post.images.length - 1}
                  className={
                    "absolute top-1/2 -translate-y-5 right-4 transition-opacity duration-300" +
                    (index == post.images.length - 1
                      ? " opacity-0"
                      : " opacity-100")
                  }
                  onPress={() => galleryRef.current?.setIndex(index + 1, true)}
                >
                  <Icons name="chevron-right" size={40} color="#fbfff1" />
                </TouchableOpacity>
                {/* <View className="absolute flex justify-between w-full h-full"><View className="w-full m-auto flex flex-row justify-between px-4"><TouchableOpacity disabled={index == 0} className={index == 0 ? " animate-hide" : " animate-show"} onPress={() => galleryRef.current?.setIndex(index-1, true)}><Icons name="chevron-left" size={40} color="#fbfff1" /></TouchableOpacity><TouchableOpacity disabled={index == post.images.length-1} className={index == post.images.length-1 ? " animate-hide" : " animate-show"} onPress={() => galleryRef.current?.setIndex(index+1, true)}><Icons name="chevron-right" size={40} color="#fbfff1" /></TouchableOpacity></View></View> */}
              </View>
            )}
            <View className="-z-10">
              <Text className="text-ivory w-11/12 text-left text-xl mx-auto font-bold ">
                {post.description}
              </Text>
              <View className="h-0.5  rounded-full w-11/12 mx-auto bg-powder_blue/50 my-4" />
              <Text className="text-4xl font-bold text-center text-ivory">
                Comments
              </Text>
              {post.comments.length == 0 && userType == UserType.PATIENT ? (
                <Text className=" text-center text-powder_blue/80">
                  (There are no comments on your post yet)
                </Text>
              ) : (
                <CommentBlock postID={post._id?.toString() as string} comments={post.comments as unknown as Comment[]} />
              )}
            </View>
          </Reanimated.ScrollView>
        ) : (
          <LoaderView />
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
      </KeyboardAvoidingView>
  );
}
