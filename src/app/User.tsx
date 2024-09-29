import useFade from "components/hooks/useFade";
import { useUser } from "components/hooks/useUser";
import { UserType } from "components/utils/Types";
import { router, useLocalSearchParams } from "expo-router";
import { ObjectId } from "mongodb";
import { Alert, Animated, Keyboard, Platform, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Reanimated, { FadeIn, FadeOut } from "react-native-reanimated";

export default function Doctor() {
  const routes = useLocalSearchParams();
  const fadeAnim = useFade();
  const {userType, reportUser} = useUser();
  return <ScrollView className="flex h-full">
  <SafeAreaView className="bg-richer_black" />
  <Animated.View
    style={{ opacity: fadeAnim }}
    className={
      "h-full bg-richer_black relative pb-44 " +
      (Platform.OS == "ios" ? "pt-16" : "pt-24")
    }
  ><View
  className={
    " absolute w-full p-4 flex justify-between z-50 flex-row " +
    (Platform.OS == "android" ? "top-7" : "")
  }
>
  <TouchableOpacity
    onPress={router.back}
    className="z-50 w-24  px-5 h-8 py-0 bg-ivory/20 rounded-full"
  >
    <Reanimated.Text
      entering={FadeIn.duration(250)}
      exiting={FadeOut.duration(250)}
      className="text-ivory h-fit  text font-bold text-center m-auto"
    >
      Back
    </Reanimated.Text>
  </TouchableOpacity>
  {/* <Text className="text-4xl text-ivory -mt-1 mx-auto font-bold">
Post
</Text> */}
  <TouchableOpacity
  disabled={userType == routes.id}
  style={{opacity: userType == routes.id ? 0 : 1}}
    className="z-50  w-24 px-5  h-8 py-0 bg-midnight_green rounded-full"
    onPress={() =>
      Alert.alert(
        "Confirm",
        `Are you sure you want to report the ${(routes.userType as string).toLowerCase()}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Report",
            style: "destructive",
            onPress: () =>reportUser(routes.id as string, routes.userType as UserType),
          },
        ],
      )
    }
  >
    {/* <Icons name="sign-out" size={38} color={"#fbfff1"} /> */}
    <Text className="text-ivory h-fit font-bold text-center m-auto">
      Report
    </Text>
  </TouchableOpacity>
</View></Animated.View></ScrollView>
}