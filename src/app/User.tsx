import { Doctor } from "@/backend/models/doctor";
import Post from "@/backend/models/post";
import { User } from "@/backend/models/user";
import { STATUS_CODES } from "@/backend/models/util";
import Icons from "@expo/vector-icons/Octicons";
import { FlashList } from "@shopify/flash-list";
import useFade from "components/hooks/useFade";
import { useLoading } from "components/hooks/useLoading";
import { usePosts } from "components/hooks/usePosts";
import { useUser } from "components/hooks/useUser";
import Loading from "components/loading/Loading";
import PostBlock from "components/misc/PostBlock";
import { callAPI, isDoctorInfo } from "components/utils/Functions";
import { UserType } from "components/utils/Types";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Animated,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Reanimated, { FadeIn, FadeOut } from "react-native-reanimated";
import Skeleton from "react-native-reanimated-skeleton";

export default function UserPage() {
  const routes = useLocalSearchParams();
  const fadeAnim = useFade();
  const { setLoading } = useLoading();
  const { reportUser, user, userType } = useUser();
  const { t } = useTranslation();
  const [u, setUser] = useState<User>();
  const { addPosts } = usePosts();
  const [pictureLoading, setPictureLoading] = useState(false);
  const [ut, setUserType] = useState<UserType>();
  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      if (!routes.id) return router.navigate("/");
      const res = await callAPI(`/users/${routes.id}`, "GET");
      if (res.status !== STATUS_CODES.SUCCESS) {
        setLoading(false);
        return Alert.alert(t("error"), t(`errors.${STATUS_CODES[res.status]}`));
      }
      setUser(res.user);
      const resUT = res.user.hasOwnProperty("picture")
        ? UserType.DOCTOR
        : UserType.PATIENT;

      if (resUT == UserType.PATIENT) addPosts(res.user.posts);

      setUserType(resUT);

      setLoading(false);
    };
    fetchData();
  }, []);
  return (
    <ScrollView className="flex h-full">
      <Loading />
      <SafeAreaView className="bg-richer_black" />
      <Animated.View
        style={{ opacity: fadeAnim }}
        className={
          "h-full bg-richer_black relative pb-44 " +
          (Platform.OS == "ios" ? "pt-16" : "pt-24")
        }
      >
        <View
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
              {t("buttons.back")}
            </Reanimated.Text>
          </TouchableOpacity>
          {/* <Text className="text-4xl text-ivory -mt-1 mx-auto font-bold">
Post
</Text> */}
          <TouchableOpacity
            disabled={user?._id?.toString() == routes.id}
            style={{ opacity: user?._id?.toString() == routes.id ? 0 : 1 }}
            className="z-50  w-24 px-5  h-8 py-0 bg-midnight_green rounded-full"
            onPress={() =>
              Alert.alert(
                t("Confirm"),
                t(`report.user`, {
                  user:
                    (ut as string).toLowerCase() == UserType.DOCTOR
                      ? t("doctor")
                      : t("patient"),
                }),
                [
                  { text: t("buttons.cancel"), style: "cancel" },
                  {
                    text: t("buttons.report"),
                    style: "destructive",
                    onPress: () =>
                      reportUser(routes.id as string, ut as UserType),
                  },
                ],
              )
            }
          >
            {/* <Icons name="sign-out" size={38} color={"#fbfff1"} /> */}
            <Text className="text-ivory h-fit font-bold text-center m-auto">
              {t("buttons.report")}
            </Text>
          </TouchableOpacity>
        </View>
        {u && (
          <View className="w-full">
            <View className="flex mx-auto pt-8  h-full w-full">
              <View className="mx-auto bg-transparent w-48 h-48 rounded-full">
                <View className=" m-auto">
                  {ut == UserType.PATIENT ? (
                    <Icons name="person" size={150} color={"#fbfff1"} />
                  ) : (
                    <View className=" w-48 h-48  aspect-square flex  rounded-xl">
                      <View className="m-auto">
                        <Image
                          onLoadStart={() => setPictureLoading(true)}
                          onLoad={() => setPictureLoading(false)}
                          className={
                            "rounded-xl border-dashed border border-ivory/80 h-full aspect-square"
                          }
                          source={(u as Doctor).picture}
                        />

                        {pictureLoading && (
                          <View className="absolute rounded-xl w-48 h-48  z-50  flex">
                            <Skeleton
                              animationType="shiver"
                              boneColor="#041225"
                              highlightColor="#b4c5e4"
                              layout={[
                                {
                                  borderRadius: 12,
                                  width: 192,
                                  height: 192,
                                },
                              ]}
                              isLoading={pictureLoading}
                            >
                              <View className="m-auto w-48 h-48">
                                <Icons
                                  name="person"
                                  size={150}
                                  color={"#fbfff1"}
                                />
                              </View>
                            </Skeleton>
                          </View>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              </View>
              <Text className="text-3xl mt-2 -mb-2 text-ivory font-semibold text-center">
                {(u as Doctor).name ?? "Patient"}
              </Text>
              {isDoctorInfo(ut as UserType, u) ? (
                <View>
                  <Text className="text-xl mt-2 -mb-2 text-ivory/70 font-semibold text-center">
                    {u.info.specialty}
                  </Text>
                  <Text className="text-center text-lg text-ivory -mb-3 mt-4 font-semibold">
                    {t("inputs.experience")}
                  </Text>
                  <Text className="text-xl mt-2 -mb-2 text-ivory/70 font-semibold text-center">
                    {u.info.experience}
                  </Text>
                  <Text className="text-center text-lg text-ivory -mb-3 mt-4 font-semibold">
                    {t("inputs.bio")}
                  </Text>
                  <Text className="text-xl mt-2 -mb-2 text-ivory/70 font-semibold text-center">
                    {u.info.about}
                  </Text>
                </View>
              ) : (
                <View>
                  <View className="w-full justify-around flex flex-row">
                    <View className="w-1/2 flex">
                      <Text className="text-center text-lg text-ivory -mb-3 mt-4 font-semibold">
                        {t("inputs.sex")}
                      </Text>
                      <Text className="text-xl mt-2 -mb-2 text-ivory/70 font-semibold text-center">
                        {u.info.sex}
                      </Text>
                      {u.info.altSex !== u.info.sex ? (
                        <View>
                          <Text className="text-center text-lg text-ivory -mb-3 mt-4 font-semibold">
                            {t("user.altSex")}
                          </Text>
                          <Text className="text-xl mt-2 -mb-2 text-ivory/70 font-semibold text-center">
                            {u.info.altSex}
                          </Text>
                          <Text className="text-center text-lg text-ivory -mb-3 mt-4 font-semibold">
                            {t("user.hormones")}
                          </Text>
                          <Text className="text-xl mt-2 -mb-2 text-ivory/70 font-semibold text-center">
                            {u.info.hormones ? t("yes") : t("no")}
                          </Text>
                          <Text className="text-center text-lg text-ivory -mb-3 mt-4 font-semibold">
                            {t("user.surgery")}
                          </Text>
                          <Text className="text-xl mt-2 -mb-2 text-ivory/70 font-semibold text-center">
                            {u.info.surgery ? t("yes") : t("no")}
                          </Text>
                        </View>
                      ) : (
                        <View>
                          <Text className="text-center text-lg text-ivory -mb-3 mt-4 font-semibold">
                            {t("inputs.blood")}
                          </Text>
                          <Text className="text-xl mt-2 -mb-2 text-ivory/70 font-semibold text-center">
                            {u.info.blood}
                          </Text>
                          <Text className="text-center text-lg text-ivory -mb-3 mt-4 font-semibold">
                            {t("user.age")}
                          </Text>
                          <Text className="text-xl mt-2 -mb-2 text-ivory/70 font-semibold text-center">
                            {t("user.ageValue", { years: u.info.age })}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View className="w-1/2 flex">
                      <Text className="text-center text-lg text-ivory -mb-3 mt-4 font-semibold">
                        {t("inputs.height")}
                      </Text>
                      <Text className="text-xl mt-2 -mb-2 text-ivory/70 font-semibold text-center">
                        {u.info.height}
                      </Text>
                      <Text className="text-center text-lg text-ivory -mb-3 mt-4 font-semibold">
                        {t("inputs.weight")}
                      </Text>
                      <Text className="text-xl mt-2 -mb-2 text-ivory/70 font-semibold text-center">
                        {u.info.weight}
                      </Text>

                      {u.info.altSex !== u.info.sex && (
                        <View>
                          <Text className="text-center text-lg text-ivory -mb-3 mt-4 font-semibold">
                            {t("inputs.blood")}
                          </Text>
                          <Text className="text-xl mt-2 -mb-2 text-ivory/70 font-semibold text-center">
                            {u.info.blood}
                          </Text>
                          <Text className="text-center text-lg text-ivory -mb-3 mt-4 font-semibold">
                            {t("user.age")}
                          </Text>
                          <Text className="text-xl mt-2 -mb-2 text-ivory/70 font-semibold text-center">
                            {t("user.ageValue", { years: u.info.age })}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View className="h-0.5 rounded-full w-72 mx-auto bg-powder_blue/50 my-4 mt-6" />
                  <Text className="text-3xl  text-ivory font-semibold text-center">
                    {t("titles.posts")}
                  </Text>
                  <FlashList
                    keyExtractor={(p, i) => `${i}-${p._id?.toString()}`}
                    ListFooterComponentStyle={{ height: -100 }}
                    estimatedItemSize={281}
                    data={u.posts as unknown as Post[]}
                    renderItem={({ item }) => (
                      <PostBlock post={item} userType={userType as UserType} />
                    )}
                  />
                </View>
              )}
            </View>
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
}
