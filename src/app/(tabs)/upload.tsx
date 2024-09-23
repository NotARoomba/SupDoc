import Post from "@/backend/models/post";
import { STATUS_CODES } from "@/backend/models/util";
import Icons from "@expo/vector-icons/Octicons";
import ImageUpload from "components/misc/ImageUpload";
import useCamera from "components/misc/useCamera";
import useFade from "components/misc/useFade";
import useGallery from "components/misc/useGallery";
import useLoading from "components/misc/useLoading";
import { callAPI } from "components/utils/Functions";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { t } from "i18next";
import React, { useEffect, useState } from "react";
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
import Reanimated, { FadeIn, FadeOut } from "react-native-reanimated";

export default function Upload() {
  const fadeAnim = useFade();
  const gallery = useGallery();
  const camera = useCamera();
  const [postData, setPostData] = useState<Post>();
  const uploadPost = async () => {
    setLoading(true);
    if (!postData) return;
    let images = [];
    for (let i = 0; i < postData.images.length; i++)
      images[i] = `data:image/png;base64,${await FileSystem.readAsStringAsync(
        postData.images[i],
        {
          encoding: "base64",
        },
      )}`;
    const res = await callAPI(`/posts/create`, "POST", {
      ...postData,
    });
    if (res.status !== STATUS_CODES.SUCCESS)
      return Alert.alert("Error", "There was an error uploading your post!");
    else {
      resetPostData();
      router.replace("/");
      setLoading(false);
      Alert.alert("Success", "Sucessfully uploaded your post!");
    }
  };
  const [activeChange, setActiveChange] = useState(false);
  const { setLoading } = useLoading();
  const [activeDelete, setActiveDelete] = useState("");
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const resetPostData = () => {
    setPostData({
      title: "",
      description: "",
      images: [],
      patient: 0,
      reports: [],
      timestamp: 0,
      comments: [],
    } as Post);
  };
  const selectImage = async (pickerType: "camera" | "gallery") => {
    if (
      !(await camera.requestPermission()) &&
      pickerType == "camera" &&
      !(await gallery.requestPermission()) &&
      pickerType !== "camera"
    )
      return;
    try {
      let result;
      if (pickerType === "camera") {
        result = await camera.takePhoto({
          allowsEditing: true,
          quality: 0.5,
        } as ImagePicker.ImagePickerOptions);
      } else {
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
    resetPostData();
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
    <TouchableWithoutFeedback className="h-full" onPress={Keyboard.dismiss}>
      {postData ? (
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
                keyboardOpen ? Keyboard.dismiss() : resetPostData()
              }
              className="z-50 w-24  px-5 h-8 py-0 bg-ivory/20 rounded-full"
            >
              <Reanimated.Text
                key={keyboardOpen ? "a" : "b"}
                entering={FadeIn.duration(250)}
                exiting={FadeOut.duration(250)}
                className="text-ivory h-fit  text font-bold text-center m-auto"
              >
                {keyboardOpen ? "Cancel" : "Clear"}
              </Reanimated.Text>
            </TouchableOpacity>
            <Text className="text-4xl text-ivory -mt-1 mx-auto font-bold">
              Post
            </Text>
            <TouchableOpacity
              className="z-50 w-24 px-5  h-8 py-0 bg-midnight_green rounded-full"
              onPress={() =>
                postData.title && postData.description
                  ? Alert.alert("Confirm", "Are you sure you want to post?", [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Post",
                        onPress: () => uploadPost(),
                      },
                    ])
                  : Alert.alert(
                      "Error",
                      "Please fill out the missing infromation",
                    )
              }
            >
              {/* <Icons name="sign-out" size={38} color={"#fbfff1"} /> */}
              <Text className="text-ivory h-fit font-bold text-center m-auto">
                Upload
              </Text>
            </TouchableOpacity>
          </View>
          <Text className="text-center text-lg text-ivory -mb-3 mt-4 font-semibold">
            Title
          </Text>
          <TextInput
            onChangeText={(n) =>
              setPostData({
                ...postData,
                title: n,
              })
            }
            value={postData.title}
            keyboardType="default"
            maxLength={50}
            placeholderTextColor={"#ffffff"}
            className="flex justify-center align-middle  m-auto h-12 p-1 py-2.5 pl-3 text-xl my-4 w-10/12   rounded-xl bg-rich_black text-ivory border border-powder_blue/20 font-semibold"
          />
          <Text className="text-center flex text-lg text-ivory -mb-3 font-semibold">
            Description ({postData.description.length}/1000)
          </Text>
          <TextInput
            onChangeText={(n) =>
              setPostData({
                ...postData,
                description: n,
              })
            }
            maxLength={1000}
            multiline
            value={postData.description}
            keyboardType="default"
            placeholderTextColor={"#ffffff"}
            className="flex justify-center   m-auto  h-52 p-1 py-2.5 pl-3 text-lg mt-3 w-10/12   rounded-xl bg-rich_black text-ivory border border-powder_blue/20 font-semibold"
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
            {postData.images.map((v, i) => (
              <ImageUpload
                activeDelete={v == activeDelete}
                setActiveDelete={setActiveDelete}
                key={i}
                image={v}
                removeImage={(image) =>
                  setPostData({
                    ...postData,
                    images: postData.images.filter((v) => v !== image),
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
                        setPostData({
                          ...postData,
                          images: [...postData.images, i],
                        });
                    },
                  },
                  {
                    text: t("images.camera"),
                    onPress: async () => {
                      const i = await selectImage("camera");
                      if (i)
                        setPostData({
                          ...postData,
                          images: [...postData.images, i],
                        });
                    },
                  },
                  { text: t("cancel"), style: "cancel" },
                ])
              }
              className=" w-64 h-64 mx-2  aspect-square flex border-dashed border border-ivory/80 rounded-xl"
            >
              <View className="m-auto">
                <Icons name="plus-circle" color={"#fbfff1"} size={50} />
              </View>
            </TouchableOpacity>
          </Reanimated.ScrollView>
        </Animated.View>
      ) : (
        <View />
      )}
    </TouchableWithoutFeedback>
  );
}
