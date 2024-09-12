import FunFact from "components/misc/FunFact";
import { View, Text, StyleSheet } from "react-native";

export default function Tab() {
  return (
    <View className="bg-richer_black h-full pt-6">
      {/* <Text className="text-6xl text-ivory">Home</Text> */}
      <FunFact />
    </View>
  );
}
