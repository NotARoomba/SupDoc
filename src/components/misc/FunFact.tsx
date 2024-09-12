import { View, Text } from "react-native";
import Icons from '@expo/vector-icons/Octicons'
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
export default function FunFact() {
    return <Animated.View entering={FadeIn.duration(500)} exiting={FadeOut.duration(500)} className="w-11/12 mx-auto px-4 py-6  rounded-xl bg-midnight_green">
        <View className="flex gap-x-4 flex-row  py-2 h-fit align-middle">
          <Icons  name="star-fill" size={35} color={"#fbfff1"}/>
            <Text className="text-ivory text-3xl my-auto font-bold">Fun Fact</Text>
            </View>
            <Text className="text-ivory/70 text-lg font-semibold">Your stomach becomes more resistant when you eat rotten tomatoes!</Text>
            </Animated.View>
}