import Comment from "@/backend/models/comment";
import Post from "@/backend/models/post";
import { UserType } from "@/backend/models/util";
import Icons from "@expo/vector-icons/Octicons";
import useFade from "components/hooks/useFade";
import { useLoading } from "components/hooks/useLoading";
import { usePosts } from "components/hooks/usePosts";
import { useUser } from "components/hooks/useUser";
import LoaderView from "components/loading/LoaderView";
import Loading from "components/loading/Loading";
import CommentBlock from "components/misc/CommentBlock";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ObjectId } from "mongodb";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Animated,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Gallery, { GalleryRef } from "react-native-awesome-gallery";
import Reanimated, {
  FadeIn,
  FadeInUp,
  FadeOut,
  FadeOutDown,
} from "react-native-reanimated";
import Skeleton from "react-native-reanimated-skeleton";

export default function PostPage() {
  const routes = useLocalSearchParams();
  const fadeAnim = useFade();
  const { userType } = useUser();
  const { loading, setLoading } = useLoading();
  const { deletePost, reportPost, addComment, posts } = usePosts();
  const [post, setPost] = useState<Post>();
  const [commentText, setCommentText] = useState("");
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const galleryRef = useRef<GalleryRef>(null);
  const [index, setIndex] = useState(0);
  const [replyingTo, setReplyingTo] = useState<ObjectId | null>(null);
  const { t } = useTranslation();
  const [comments, setComments] = useState<Comment[]>([]);
  useEffect(() => {
    const currentPost = posts.find((v) => v._id?.toString() === routes.id);
    // Only update if the current post or its comments change
    if (currentPost) {
      const newComments = currentPost.comments || comments; // Assuming comments is an array
      if (JSON.stringify(newComments) !== JSON.stringify(comments)) {
        setPost(currentPost);
        setComments(newComments);
      }
    }
  }, [posts, routes]);

  const handleAddComment = async () => {
    setLoading(true);
    if (commentText.trim()) {
      Keyboard.dismiss();
      await addComment(post?._id as ObjectId, commentText, replyingTo);
      setCommentText("");
      setReplyingTo(null);
      setLoading(false);
    } else {
      Alert.alert(t("posts.emptyComment"));
      setLoading(false);
    }
  };

  const handleStopReply = () => {
    setReplyingTo(null);
  };
  useEffect(() => {
    console.log(posts)
  }, [])

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "position" : "position"}
      style={{ flex: 1 }}
    >
      <Loading />
      <ScrollView className="flex h-full">
        <SafeAreaView className="bg-richer_black" />
        <Animated.View
          style={{ opacity: fadeAnim }}
          className={
            "h-full bg-richer_black relative pb-44 " +
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
              onPress={keyboardOpen ? Keyboard.dismiss : router.back}
              className="z-50 w-24  px-5 h-8 py-0 bg-ivory/20 rounded-full"
            >
              <Reanimated.Text
                key={keyboardOpen ? "a" : "b"}
                entering={FadeIn.duration(250)}
                exiting={FadeOut.duration(250)}
                className="text-ivory h-fit  text font-bold text-center m-auto"
              >
                {keyboardOpen ? t("buttons.cancel") : t("buttons.back")}
              </Reanimated.Text>
            </TouchableOpacity>
            {/* <Text className="text-4xl text-ivory -mt-1 mx-auto font-bold">
          Post
        </Text> */}
            {post && <TouchableOpacity
              className="z-50  w-24 px-5  h-8 py-0 bg-midnight_green rounded-full"
              onPress={() =>
                Alert.alert(
                  t("confirmTitle"),
                  t("posts.reportDelete", {
                    reportDelete:
                      userType == UserType.DOCTOR
                        ? t("buttons.report").toLocaleLowerCase()
                        : t("buttons.delete").toLocaleLowerCase(),
                  }),
                  [
                    { text: t("buttons.cancel"), style: "cancel" },
                    {
                      text:
                        userType == UserType.DOCTOR
                          ? t("buttons.report")
                          : t("buttons.delete"),
                      style: "destructive",
                      onPress: () =>
                        userType == UserType.DOCTOR
                          ? reportPost(routes.id as string)
                          : deletePost(routes.id as string),
                    },
                  ],
                )
              }
            >
              {/* <Icons name="sign-out" size={38} color={"#fbfff1"} /> */}
              <Text className="text-ivory h-fit font-bold text-center m-auto">
                {userType == UserType.DOCTOR
                  ? t("buttons.report")
                  : t("buttons.delete")}
              </Text>
            </TouchableOpacity>}
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
                        contentContainerStyle={{ justifyContent: "space-between" }}
            className={"flex flex-row mt-4 static " + (expanded != -1 ? "h-full" : "")}
                      >{post.images.map((v, i) => <TouchableOpacity
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
                      const [pictureLoading, setPictureLoading] =
                        useState(false);
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
                    onPress={() =>
                      galleryRef.current?.setIndex(index - 1, true)
                    }
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
                    onPress={() =>
                      galleryRef.current?.setIndex(index + 1, true)
                    }
                  >
                    <Icons name="chevron-right" size={40} color="#fbfff1" />
                  </TouchableOpacity>
                  {/* <View className="absolute flex justify-between w-full h-full"><View className="w-full m-auto flex flex-row justify-between px-4"><TouchableOpacity disabled={index == 0} className={index == 0 ? " animate-hide" : " animate-show"} onPress={() => galleryRef.current?.setIndex(index-1, true)}><Icons name="chevron-left" size={40} color="#fbfff1" /></TouchableOpacity><TouchableOpacity disabled={index == post.images.length-1} className={index == post.images.length-1 ? " animate-hide" : " animate-show"} onPress={() => galleryRef.current?.setIndex(index+1, true)}><Icons name="chevron-right" size={40} color="#fbfff1" /></TouchableOpacity></View></View> */}
                </View>
              )}
              {post.images.length == 0 && userType == UserType.DOCTOR && (
                <View
                  className={
                    "h-0.5  rounded-full w-11/12 mx-auto bg-powder_blue/50 mt-4"
                  }
                />
              )}
              <View className="-z-10">
                {userType == UserType.DOCTOR && (
                  <View>
                    {post.images.length !== 0 && (
                      <View className="h-0.5  rounded-full w-11/12 mx-auto bg-powder_blue/50 my-4 mb-0" />
                    )}
                    <View className="w-full justify-around flex flex-row">
                      <View className="w-1/2 flex">
                        <Text className="text-center text-lg text-ivory -mb-3 mt-4 font-semibold">
                          {t("inputs.sex")}
                        </Text>
                        <Text className="text-xl mt-2 -mb-2 text-ivory/70 font-semibold text-center">
                          {post.info.sex}
                        </Text>
                        {post.info.altSex !== post.info.sex ? (
                          <View>
                            <Text className="text-center text-lg text-ivory -mb-3 mt-4 font-semibold">
                              {t("user.altSex")}
                            </Text>
                            <Text className="text-xl mt-2 -mb-2 text-ivory/70 font-semibold text-center">
                              {post.info.altSex}
                            </Text>
                            <Text className="text-center text-lg text-ivory -mb-3 mt-4 font-semibold">
                              {t("user.hormones")}
                            </Text>
                            <Text className="text-xl mt-2 -mb-2 text-ivory/70 font-semibold text-center">
                              {post.info.hormones ? t("yes") : t("no")}
                            </Text>
                            <Text className="text-center text-lg text-ivory -mb-3 mt-4 font-semibold">
                              {t("user.surgery")}
                            </Text>
                            <Text className="text-xl mt-2 -mb-2 text-ivory/70 font-semibold text-center">
                              {post.info.surgery ? t("yes") : t("no")}
                            </Text>
                          </View>
                        ) : (
                          <View>
                            <Text className="text-center text-lg text-ivory -mb-3 mt-4 font-semibold">
                              {t("inputs.blood")}
                            </Text>
                            <Text className="text-xl mt-2 -mb-2 text-ivory/70 font-semibold text-center">
                              {post.info.blood}
                            </Text>
                            <Text className="text-center text-lg text-ivory -mb-3 mt-4 font-semibold">
                              {t("user.age")}
                            </Text>
                            <Text className="text-xl mt-2 -mb-2 text-ivory/70 font-semibold text-center">
                              {t("user.ageValue", { years: post.info.age })}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View className="w-1/2 flex">
                        <Text className="text-center text-lg text-ivory -mb-3 mt-4 font-semibold">
                          {t("inputs.height")}
                        </Text>
                        <Text className="text-xl mt-2 -mb-2 text-ivory/70 font-semibold text-center">
                          {post.info.height}
                        </Text>
                        <Text className="text-center text-lg text-ivory -mb-3 mt-4 font-semibold">
                          {t("inputs.weight")}
                        </Text>
                        <Text className="text-xl mt-2 -mb-2 text-ivory/70 font-semibold text-center">
                          {post.info.weight}
                        </Text>

                        {post.info.altSex !== post.info.sex && (
                          <View>
                            <Text className="text-center text-lg text-ivory -mb-3 mt-4 font-semibold">
                              {t("inputs.blood")}
                            </Text>
                            <Text className="text-xl mt-2 -mb-2 text-ivory/70 font-semibold text-center">
                              {post.info.blood}
                            </Text>
                            <Text className="text-center text-lg text-ivory -mb-3 mt-4 font-semibold">
                              {t("user.age")}
                            </Text>
                            <Text className="text-xl mt-2 -mb-2 text-ivory/70 font-semibold text-center">
                              {t("user.ageValue", { years: post.info.age })}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        router.navigate({
                          pathname: "/User",
                          params: { id: post.patient.toString() },
                        })
                      }
                      className="bg-oxford_blue w-11/12 mx-auto mt-4 px-5 py-2 rounded-xl"
                    >
                      <Text className="text-ivory text-center font-semibold text-lg  ">
                        {t("posts.patientProfile")}
                      </Text>
                    </TouchableOpacity>
                    <View className="h-0.5  rounded-full w-11/12 mx-auto bg-powder_blue/50 my-4" />
                  </View>
                )}
                {post.images.length == 0 && userType == UserType.PATIENT && (
                  <View className="h-0.5  rounded-full w-11/12 mx-auto bg-powder_blue/50 my-4 " />
                )}

                <Text className="text-4xl mb-1 font-bold text-center text-ivory">
                  {t("posts.description")}
                </Text>
                <Text className="text-ivory w-11/12 text-left text-xl mx-auto font-bold ">
                  {post.description}
                </Text>
                <View className="h-0.5  rounded-full w-11/12 mx-auto bg-powder_blue/50 my-4" />
                <Text className="text-4xl font-bold text-center text-ivory">
                  {t("posts.comments")}
                </Text>
                {post.comments.length == 0 ? (
                  <Text className=" text-center text-powder_blue/80">
                    {userType == UserType.PATIENT
                      ? t("posts.commentsPatient")
                      : t("posts.commentsDoctor")}
                  </Text>
                ) : (
                  <CommentBlock
                    post={post._id as ObjectId}
                    parent={null}
                    replyingTo={replyingTo}
                    setReplyingTo={setReplyingTo}
                    comments={comments}
                  />
                )}
              </View>
            </Reanimated.ScrollView>
          ) : (
            <LoaderView />
          )}
        </Animated.View>
      </ScrollView>
      {((post?.comments.length !== 0 && userType == UserType.PATIENT) ||
        userType == UserType.DOCTOR) && post && (
        <View className="absolute flex w-full bottom-6">
          <Reanimated.View
            entering={FadeInUp.delay(500)}
            exiting={FadeOutDown.duration(500)}
            className=" mx-auto w-11/12"
          >
            <TextInput
              placeholder={
                replyingTo ? t("posts.replyComment") : t("posts.addComment")
              }
              value={commentText}
              onChangeText={setCommentText}
              className="bg-gray-700 text-ivory p-3 rounded-lg"
            />
            <TouchableOpacity
              onPress={handleAddComment}
              className="mt-2 bg-midnight_green p-3 rounded-lg"
            >
              <Reanimated.Text
                entering={FadeIn.duration(500)}
                exiting={FadeOut.duration(500)}
                className="text-ivory text-center font-bold"
              >
                {replyingTo ? t("posts.postReply") : t("posts.postComment")}
              </Reanimated.Text>
            </TouchableOpacity>

            {replyingTo && (
              <Reanimated.View
                entering={FadeInUp.duration(300)}
                exiting={FadeOutDown.duration(300)}
                className="mb-2"
              >
                <TouchableOpacity
                  onPress={handleStopReply}
                  className="mt-2 bg-red-500 p-3 rounded-lg"
                >
                  <Text className="text-ivory text-center font-bold">
                    {t("posts.cancelReply")}
                  </Text>
                </TouchableOpacity>
              </Reanimated.View>
            )}
          </Reanimated.View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
