import { Alert, Text, View } from "react-native";
import { SignupProps, UserType } from "../components/utils/Types";
import { useEffect, useState } from "react";

export default function Signup({
  info,
  index,
  setIndex,
  setIsLogged,
}: SignupProps) {
  useEffect(() => {
    if (index == 3) {
      if (!(info.number && info.identification)) {
        setIndex(index - 1);
        Alert.alert("Missing Info", "Please fill out the information!");
      } else {
        //checks if the information isnt duplocate
      }
    }
  }, [index]);
  return (
    <View className="h-full ">
      {index == 2 ? (
        <View>
          {/* needs to show a text box to input a phoen number and ti */}
          <Text className="text-ivory">JASDJAJSD</Text>
        </View>
      ) : index == 3 ? (
        info.type == UserType.PATIENT ? (
          <View className="h-full flex flex-col"></View>
        ) : (
          <View></View>
        )
      ) : (
        <View>OTHER OAGE INDEX</View>
      )}
    </View>
  );
}
