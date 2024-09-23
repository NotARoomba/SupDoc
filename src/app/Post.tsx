import Post from "@/backend/models/post";
import { STATUS_CODES } from "@/backend/models/util";
import LoaderView from "components/misc/LoaderView";
import useFade from "components/misc/useFade";
import { callAPI } from "components/utils/Functions";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Animated,
  Keyboard,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Reanimated, { FadeIn, FadeOut } from "react-native-reanimated";

export default function PostPage() {
  const routes = useLocalSearchParams();
  const fadeAnim = useFade();
  const [post, setPost] = useState<Post>();
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const { t } = useTranslation();
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
    <Animated.View
      style={{ opacity: fadeAnim }}
      className={
        "h-full bg-richer_black relative " +
        (Platform.OS == "ios" ? "pt-6" : "pt-16")
      }
    >
      <View
        className={
          " w-full p-4 flex justify-between z-50 flex-row " +
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
            true
              ? Alert.alert("Confirm", "Are you sure you want to post?", [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Post",
                    onPress: () => console.log("ASD"),
                  },
                ])
              : Alert.alert("Error", "Please fill out the missing infromation")
          }
        >
          {/* <Icons name="sign-out" size={38} color={"#fbfff1"} /> */}
          <Text className="text-ivory h-fit font-bold text-center m-auto">
            Upload
          </Text>
        </TouchableOpacity>
      </View>
      {post ? (
        <Reanimated.View
          entering={FadeIn.duration(500)}
          exiting={FadeOut.duration(500)}
          className="h-full z-10 w-full"
        >
          <Text className="text-ivory text-4xl mx-auto font-bold ">
            {post.title}
          </Text>
        </Reanimated.View>
      ) : (
        <LoaderView />
      )}
    </Animated.View>
  );
}
