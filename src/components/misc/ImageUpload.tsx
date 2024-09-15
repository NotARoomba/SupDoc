import { ImageUploadProps } from "components/utils/Types";
import { useState } from "react";
import { Alert, Image, Pressable, TouchableOpacity, TouchableWithoutFeedback, Vibration, View } from "react-native";
import Icons from "@expo/vector-icons/Octicons";
import prompt from "@powerdesigninc/react-native-prompt";
import Animated, { FadeIn, FadeInUp, FadeOut, FadeOutDown, FadeOutUp, StretchInY, StretchOutX, ZoomOut } from "react-native-reanimated";

export default function ImageUpload({ image, removeImage, activeDelete, setActiveDelete }: ImageUploadProps) {
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
      >{activeDelete && (
        <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(250)}
        className="h-full rounded-xl w-full bg-ivory/50"
      ><TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "Remove Image",
                  "Are you sure you want to remove this image?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Remove",
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
