import { LanguageCodes } from "@/backend/models/util";
import Icons from "@expo/vector-icons/Octicons";
import { FunFactProps } from "components/utils/Types";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

export default function FunFact({fact}: FunFactProps) {
  const { t, i18n } = useTranslation();
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
      <Text className="text-ivory/70 text-lg font-semibold">
        {fact.text[i18n.language as LanguageCodes]}
      </Text>
    </Animated.View>
  );
}
