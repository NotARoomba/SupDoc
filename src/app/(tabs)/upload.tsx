import Icons from "@expo/vector-icons/Octicons";
import useCamera from "components/hooks/useCamera";
import useFade from "components/hooks/useFade";
import useGallery from "components/hooks/useGallery";
import { useLoading } from "components/hooks/useLoading";
import { usePosts } from "components/hooks/usePosts";
import Loader from "components/loading/Loader";
import ImageUpload from "components/misc/ImageUpload";
import * as ImagePicker from "expo-image-picker";
import { useColorScheme } from "nativewind";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Animated,
  Dimensions,
  Keyboard,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import Reanimated, { FadeIn, FadeOut } from "react-native-reanimated";

export default function Upload() {
  const fadeAnim = useFade();
  const gallery = useGallery();
  const camera = useCamera();
  const { t } = useTranslation();
  const { loading, setLoading } = useLoading();
  const { createPost, resetPostEdit, setPostEdit, postEdit } = usePosts();
  const [activeChange, setActiveChange] = useState(false);
  const [activeDelete, setActiveDelete] = useState("");
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const { colorScheme } = useColorScheme();

  const selectImage = async (pickerType: "camera" | "gallery") => {
    try {
      let result;
      if (pickerType === "camera") {
        if (!(await camera.requestPermission())) return;
        result = await camera.takePhoto({
          allowsEditing: true,
          quality: 0.5,
        } as ImagePicker.ImagePickerOptions);
      } else {
        if (!(await gallery.requestPermission())) return;
        result = await gallery.selectImage({
          quality: 0.5,
          allowsEditing: true,
        });
      }
      setActiveChange(false);
      return result.assets ? result.assets[0].uri : null;
    } catch (error) {
      Alert.alert(t("images.readingTitle"), t("images.readingDescription"));
      console.log(error);
    }
  };
  useEffect(() => {
    resetPostEdit();
    const showListener = Keyboard.addListener("keyboardWillShow", () => {
      setKeyboardOpen(true);
    });
    const hideListener = Keyboard.addListener("keyboardWillHide", () => {
      setKeyboardOpen(false);
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);
  return (
    <TouchableWithoutFeedback
      className="h-full dark:bg-richer_black bg-ivory"
      onPress={Keyboard.dismiss}
    >
      {postEdit ? (
        <Animated.View
          style={{ opacity: fadeAnim }}
          className={
            "flex h-full " + (Platform.OS == "android" ? "pt-20" : "pt-12")
          }
        >
          <View
            className={
              "absolute w-full p-4 flex justify-between z-50 flex-row " +
              (Platform.OS == "android" ? "top-7" : "")
            }
          >
            <TouchableOpacity
              onPress={() =>
                keyboardOpen ? Keyboard.dismiss() : resetPostEdit()
              }
              className="z-50 w-24  px-5 h-8 py-0 dark:bg-ivory/20 bg-blue_munsell rounded-full"
            >
              <Reanimated.Text
                key={keyboardOpen ? "a" : "b"}
                entering={FadeIn.duration(250)}
                exiting={FadeOut.duration(250)}
                className="text-ivory  h-fit  text font-bold text-center m-auto"
              >
                {keyboardOpen ? t("buttons.cancel") : t("buttons.clear")}
              </Reanimated.Text>
            </TouchableOpacity>
            <Text className="text-4xl dark:text-ivory text-richer_black -mt-1 mx-auto font-bold">
              {t("buttons.post")}
            </Text>
            <TouchableOpacity
              className="z-50 w-24 px-5  h-8 py-0 dark:bg-midnight_green bg-prussian_blue rounded-full"
              onPress={() =>
                postEdit.title && postEdit.description
                  ? Alert.alert(
                      t("confirmTitle"),
                      t("upload.confirmDescription"),
                      [
                        { text: t("buttons.cancel"), style: "cancel" },
                        {
                          text: t("buttons.post"),
                          onPress: () => createPost(),
                        },
                      ],
                    )
                  : Alert.alert(t("error"), t("errors.fillmissing"))
              }
            >
              {/* <Icons name="sign-out" size={38} color={colorScheme == 'dark' ? "#fbfff1" : "#023c4d"}  /> */}
              <Text className="text-ivory h-fit font-bold text-center  m-auto">
                {t("titles.upload")}
              </Text>
            </TouchableOpacity>
          </View>
          <Text className="text-center text-lg dark:text-ivory text-richer_black mt-4 font-semibold">
            {t("upload.title")}
          </Text>
          <TextInput
            onChangeText={(n) =>
              setPostEdit({
                ...postEdit,
                title: n,
              })
            }
            value={postEdit.title}
            keyboardType="default"
            maxLength={50}
            placeholderTextColor={"#ffffff"}
            className="flex justify-center align-middle  m-auto h-12 p-1 py-2.5 pl-3 text-xl mb-4 w-10/12   rounded-xl dark:bg-rich_black/80 bg-prussian_blue text-ivory border dark:border-powder_blue/20 border-oxforder_blue/25 font-semibold"
          />
          <Text className="text-center flex text-lg dark:text-ivory text-richer_black font-semibold">
            {t("upload.description")} ({postEdit.description.length}/1000)
          </Text>
          <TextInput
            onChangeText={(n) =>
              setPostEdit({
                ...postEdit,
                description: n,
              })
            }
            maxLength={1000}
            multiline
            value={postEdit.description}
            keyboardType="default"
            placeholderTextColor={"#ffffff"}
            className="flex justify-center   m-auto  h-52 p-1 py-2.5 pl-3 text-lg  w-10/12   rounded-xl dark:bg-rich_black/80 bg-prussian_blue text-ivory border dark:border-powder_blue/20 border-oxforder_blue/25 font-semibold"
          />
          <Reanimated.ScrollView
            centerContent
            horizontal
            entering={FadeIn.duration(500)}
            // exiting={FadeOut.duration(0)}
            contentContainerStyle={{ justifyContent: "space-between" }}
            style={{ width: Dimensions.get("window").width }}
            className="flex flex-row h-64 m-auto py-4"
          >
            {postEdit.images.map((v, i) => (
              <ImageUpload
                activeDelete={v == activeDelete}
                setActiveDelete={setActiveDelete}
                key={i}
                image={v}
                removeImage={(image) =>
                  setPostEdit({
                    ...postEdit,
                    images: postEdit.images.filter((v) => v !== image),
                  })
                }
              />
            ))}
            <TouchableOpacity
              onPress={() =>
                Alert.alert(t("images.choose"), undefined, [
                  {
                    text: t("images.gallery"),
                    onPress: async () => {
                      const i = await selectImage("gallery");
                      if (i)
                        setPostEdit({
                          ...postEdit,
                          images: [...postEdit.images, i],
                        });
                    },
                  },
                  {
                    text: t("images.camera"),
                    onPress: async () => {
                      const i = await selectImage("camera");
                      if (i)
                        setPostEdit({
                          ...postEdit,
                          images: [...postEdit.images, i],
                        });
                    },
                  },
                  { text: t("buttons.cancel"), style: "cancel" },
                ])
              }
              className=" w-64 h-64 mx-2  aspect-square flex border-dashed border dark:border-ivory/80 border-midnight_green rounded-xl"
            >
              <View className="m-auto">
                <Icons
                  name="plus-circle"
                  color={colorScheme == "dark" ? "#fbfff1" : "#023c4d"}
                  size={50}
                />
              </View>
            </TouchableOpacity>
          </Reanimated.ScrollView>
          <Spinner
            visible={loading}
            overlayColor="#00000099"
            textContent={"Loading"}
            customIndicator={<Loader />}
            textStyle={{ color: "#fff", marginTop: -25 }}
            animation="fade"
          />
        </Animated.View>
      ) : (
        <View />
      )}
    </TouchableWithoutFeedback>
  );
}
