import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";
import { Alert, Linking } from "react-native";

export default function useGallery() {
  const { t } = useTranslation();
  const requestPermission = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!granted) {
      Alert.alert(t("images.galleryTitle"), t("images.galleryDescription"), [
        { text: t("buttons.cancel"), style: "cancel" },
        {
          text: t("settings"),
          isPreferred: true,
          onPress: Linking.openSettings,
        },
      ]);
    }
    return granted;
  };

  const selectImage = async (options: ImagePicker.ImagePickerOptions) => {
    options = { mediaTypes: ImagePicker.MediaTypeOptions.Images, ...options };

    return await ImagePicker.launchImageLibraryAsync(options);
  };

  // useEffect(() => {
  //     requestPermission();
  // }, []);

  return { selectImage, requestPermission };
}
