import {useEffect} from "react";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export default function usePhotos() {

    const requestPermission = async () => {
        const { granted} = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!granted) {
            Alert.alert(
                'Device settings alert',
                'You need to allow media library permissions for this to work'
            );
        }
    }

    const selectImage = async (options: ImagePicker.ImagePickerOptions) => {
        options = {mediaTypes: ImagePicker.MediaTypeOptions.Images, ...options };

        return await ImagePicker.launchImageLibraryAsync(options);
    }

    useEffect(() => {
        requestPermission();
    }, []);

    return {selectImage};
};
