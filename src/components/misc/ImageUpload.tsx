import Icons from "@expo/vector-icons/Octicons";
import { ImageUploadProps } from "components/utils/Types";
import { useTranslation } from "react-i18next";
import { Alert, Image, Pressable, TouchableOpacity } from "react-native";
import Animated, { FadeIn, FadeInUp, FadeOut } from "react-native-reanimated";

export default function ImageUpload({
  image,
  removeImage,
  activeDelete,
  setActiveDelete,
}: ImageUploadProps) {
  const { t } = useTranslation();
  // need to add a square image that has a fixed height and on press there appears a
  // opacity with a trash icon to remove
  return (
    <Animated.View
      // exiting={FadeOut.duration(500)}
      entering={FadeInUp.duration(500)}
      className="w-64 relative mx-2 h-64 z-50 flex aspect-square border border-solid border-ivory/80 rounded-xl"
    >
      <Image src={image} className=" aspect-square rounded-xl" />
      <Pressable
        onPress={() => setActiveDelete(activeDelete ? "" : image)}
        className="absolute rounded-xl w-64 h-64 z-50  flex"
      >
        {activeDelete && (
          <Animated.View
            entering={FadeIn.duration(250)}
            exiting={FadeOut.duration(250)}
            className="h-full rounded-xl w-full bg-ivory/50"
          >
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  t("images.removeTitle"),
                  t("images.removeDescription"),
                  [
                    { text: t("buttons.cancel"), style: "cancel" },
                    {
                      text: t("remove"),
                      style: "destructive",
                      onPress: () => removeImage(image),
                    },
                  ],
                )
              }
              className="m-auto p-4"
            >
              <Icons name="trash" size={60} color={"#ff000099"} />
            </TouchableOpacity>
          </Animated.View>
        )}
      </Pressable>
    </Animated.View>
  );
}
