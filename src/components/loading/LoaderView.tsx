import { Text, View } from "react-native";
import Loader from "./Loader";
import { useTranslation } from "react-i18next";

export default function LoaderView() {
  const { t } = useTranslation();
  return (
    <View className="flex h-96 w-full">
      <View className="m-auto">
        <Loader />
        <Text className="text-ivory text-center font-semibold text-xl ">
          {t("loading")}
        </Text>
      </View>
    </View>
  );
}
