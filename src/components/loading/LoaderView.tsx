import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import Loader from "./Loader";

export default function LoaderView() {
  const { t } = useTranslation();
  return (
    <View className="flex h-96 w-full">
      <View className="m-auto">
        <Loader />
        <Text className="dark:text-ivory text-richer_black text-center font-semibold text-xl ">
          {t("loading")}
        </Text>
      </View>
    </View>
  );
}
