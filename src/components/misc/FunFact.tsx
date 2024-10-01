import { LanguageCodes } from "@/backend/models/util";
import Icons from "@expo/vector-icons/Octicons";
import { FunFactProps } from "components/utils/Types";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import Skeleton from "react-native-reanimated-skeleton";

export default function FunFact({fact}: FunFactProps) {
  const { t, i18n } = useTranslation();
  useEffect(() => {
    console.log(i18n.language, fact)
  }, [])
  return (
    <Animated.View
      entering={FadeIn.duration(500)}
      exiting={FadeOut.duration(500)}
      className="w-11/12 mx-auto px-4 py-6  rounded-xl bg-midnight_green"
    >
              
      <View className="flex gap-x-4 flex-row  py-2 h-fit align-middle">
        <Icons name="star-fill" size={35} color={"#fbfff1"} />
        <Text className="text-ivory text-3xl my-auto font-bold">
          {t("titles.fact")}
        </Text>
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
      <Animated.Text entering={FadeIn.duration(500)} className="text-ivory/70 text-lg -ml-1 font-semibold">
        {fact && fact.text[i18n.language as LanguageCodes]}
      </Animated.Text></Skeleton>
    </Animated.View>
  );
}
