import FunFact from "components/misc/FunFact";
import { View, Text, StyleSheet, Platform } from "react-native";

export default function Tab() {
  return (
    <View className={"bg-richer_black h-full pt-6 " + (Platform.OS == 'ios' ? 'pt-6' : 'pt-16')}>
      <FunFact />
    </View>
  );
}
