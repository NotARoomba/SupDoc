import Post from "@/backend/models/post";
import FunFact from "components/misc/FunFact";
import { useState } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Line } from "react-native-svg";

export default function Index() {
  const [posts, setPosts] = useState<Post[]>([]);
  return (
    <View  className={"h-full pt-6 " + (Platform.OS == 'ios' ? 'pt-6' : 'pt-16')}>
      <FunFact />
      <View className="h-0.5 rounded-full w-11/12 mx-auto bg-powder_blue/50 my-4"/>
      <Text className="text-4xl font-bold text-center text-ivory">Your Posts</Text>
      {posts.length == 0 ? <Text className=" text-center text-powder_blue/80">(You have not posted anything yet)</Text> :  posts.map((v, i) => <View key={i} />)}
    </View>
  );
}
