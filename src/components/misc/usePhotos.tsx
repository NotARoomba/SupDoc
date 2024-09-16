import { useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import { Alert, Linking } from "react-native";

export default function usePhotos() {
  const requestPermission = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!granted) {
      Alert.alert(
        "Allow Gallery Access",
        "You need to allow media library permissions for this to work",
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

  const selectImage = async (options: ImagePicker.ImagePickerOptions) => {
    options = { mediaTypes: ImagePicker.MediaTypeOptions.Images, ...options };

    return await ImagePicker.launchImageLibraryAsync(options);
  };

  // useEffect(() => {
  //     requestPermission();
  // }, []);

  return { selectImage, requestPermission };
}
