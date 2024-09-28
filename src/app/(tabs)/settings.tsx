import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

export default function Settings() {
  const { t } = useTranslation();
  return (
    <View className="bg-richer_black h-full">
      <Text className="text-6xl text-ivory">{t("setting")}</Text>
    </View>
  );
}
