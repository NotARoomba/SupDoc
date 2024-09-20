import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

export default function Pins() {
  const { t } = useTranslation();
  return (
    <View>
      <Text className="text-6xl text-ivory">{t("titles.pins")}</Text>
    </View>
  );
}
