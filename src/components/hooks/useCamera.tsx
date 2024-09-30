import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";
import { Alert, Linking } from "react-native";

export default function useCamera() {
  const { t } = useTranslation();
  const requestPermission = async () => {
    const { granted } = await Camera.requestCameraPermissionsAsync();
    if (!granted) {
      Alert.alert(t("images.cameraTitle"), t("images.cameraDescription"), [
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

  const takePhoto = async (options: ImagePicker.ImagePickerOptions) => {
    options = { mediaTypes: ImagePicker.MediaTypeOptions.Images, ...options };

    return await ImagePicker.launchCameraAsync(options);
  };

  // useEffect(() => {
  //     requestPermission();
  // }, []);

  return { takePhoto, requestPermission };
}
