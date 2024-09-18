import Post from "@/backend/models/post";
import { UserType } from "@/backend/models/util";
import FunFact from "components/misc/FunFact";
import useFade from "components/misc/useFade";
import { HomeProps } from "components/utils/Types";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Animated, Platform, ScrollView, Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import * as SecureStore from 'expo-secure-store'
export default function Index() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [userType, setUserType] = useState<UserType>(UserType.PATIENT)
  const fadeAnim = useFade();
  const { t } = useTranslation();
  useEffect(() => {
    const fetchData = async () => {
      setUserType((await SecureStore.getItemAsync(
        process.env.EXPO_PUBLIC_KEY_NAME_TYPE,
      )) as UserType);
      }
    fetchData();}, [])
  return (
    <Animated.View
      style={{ opacity: fadeAnim }}
      className={"h-full pt-6 " + (Platform.OS == "ios" ? "pt-6" : "pt-16")}
    >{userType == UserType.PATIENT ? <View className="h-full">
      
      <FunFact />
      <View className="h-0.5 rounded-full w-11/12 mx-auto bg-powder_blue/50 my-4" />
      <Text className="text-4xl font-bold text-center text-ivory">
        {t('titles.posts')}
      </Text>
      {posts.length == 0 ? (
        <Text className=" text-center text-powder_blue/80">
          {t('posts.none')}
        </Text>
      ) : (
        posts.map((v, i) => <View key={i} />)
      )}
      </View> : <View className="h-full"><Text className="text-6xl font-bold text-center text-ivory">Posts</Text><FlashList estimatedItemSize={70}  data={posts}
      renderItem={({ item }) => <Text className="text-6xl font-medium text-ivory">{item.title}</Text>} className="h-full"/></View>}
    </Animated.View>
  );
}
