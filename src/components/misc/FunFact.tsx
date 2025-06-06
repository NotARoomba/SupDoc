import { LanguageCodes, UserType } from "@/backend/models/util";
import Icons from "@expo/vector-icons/Octicons";
import { usePosts } from "components/hooks/usePosts";
import { useUser } from "components/hooks/useUser";
import { FunFactProps } from "components/utils/Types";
import { ObjectId } from "mongodb";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import Skeleton from "react-native-reanimated-skeleton";

export default function FunFact({ fact }: FunFactProps) {
  const { t, i18n } = useTranslation();
  const { user, userType } = useUser();
  const { likeFact, facts } = usePosts();
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setLiked(
      facts.find(
        (v) =>
          v._id == fact._id &&
          v.likes.includes(user?._id?.toString() as string),
      )
        ? true
        : false,
    );
  }, [facts]);

  return (
    <Animated.View
      entering={FadeIn.duration(500)}
      exiting={FadeOut.duration(500)}
      className="w-11/12 mx-auto px-4 py-6 mt-4 rounded-xl dark:bg-midnight_green bg-prussian_blue"
    >
      <View className="flex gap-x-4 flex-row py-2 w-full h-fit align-middle">
        <Icons name="star-fill" size={35} color={"#fbfff1"} />
        <Text className="text-ivory  text-3xl my-auto mr-auto font-bold">
          {t("titles.fact")}
        </Text>

        {userType == UserType.DOCTOR && (
          <View className="flex flex-row justify-end ml-auto">
            <TouchableOpacity
              onPress={() => {
                setLiked(!liked);
                likeFact(fact._id as ObjectId);
              }}
            >
              <Icons name="heart" size={30} color={liked ? "red" : "#fbfff1"} />
            </TouchableOpacity>
          </View>
        )}
      </View>
      <Skeleton
        animationDirection="horizontalRight"
        boneColor="#023c4d"
        highlightColor="#b4c5e4"
        layout={[
          {
            width: "100%",
            height: 48,
            zIndex: 50,
          },
        ]}
        isLoading={!fact}
      >
        <Animated.Text
          entering={FadeIn.duration(500)}
          className="text-ivory/70  text-lg -ml-1 font-semibold"
        >
          {fact && fact.text[i18n.language as LanguageCodes]}
        </Animated.Text>
      </Skeleton>
    </Animated.View>
  );
}
