import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Alert, Linking } from "react-native";

export default function useCamera() {
  const requestPermission = async () => {
    const { granted } = await Camera.requestCameraPermissionsAsync();
    if (!granted) {
      Alert.alert(
        "Allow Camera Access",
        "You need to allow camera permissions for this to work",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Settings",
            isPreferred: true,
            onPress: Linking.openSettings,
          },
        ],
      );
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
