import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SignupProps, UserType } from "../components/utils/Types";
import React, { useEffect, useState } from "react";
import {CountryPicker} from 'react-native-country-codes-picker'
import { callAPI } from "../components/utils/Functions";

export default function Signup({
  info,
  index,
  setIndex,
  setInfo,
  setIsLogged,
}: SignupProps) {
  /// setInfo({...info, info.(PROPIEDAD Q QUIERES CAMBIAR)})
  const [show, setShow] = useState(false);
  const [countryCode, setCountryCode] = useState('');
  const [number, setNumber] = useState('');

  useEffect(() => {
    if (index == 3) {
      if (!(info.number && info.identification)) {
        callAPI("/", "GET").then((res: any) => {
          console.log(res, "RES")
        })
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
        {/* needs to show a text box to input a phone number and identificatio number */}
        <View className="flex flex-row justify-center m-auto align-middle">
              <TouchableOpacity
                onPress={() => setShow(!show)}
                className=" bg-oxford_blue text-center align-middle p-1 h-12 mt-3 w-3/12 rounded-l-xl">
                <Text className="align-middle m-auto text-lg text-ivory font-bold">
                  {countryCode}
                </Text>
              </TouchableOpacity>
              <TextInput
                onChangeText={setNumber}
                value={number}
                keyboardType="phone-pad"
                placeholderTextColor={'#ffffff'}
                className="flex justify-center align-middle  my-auto ml-0 h-13 p-1 py-2.5 pl-3 text-xl mt-3 w-8/12 rounded-xl rounded-l-none bg-oxford_blue text-ivory font-bold"
              />
            </View>
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
      <CountryPicker
            show={show}
            // when picker button press you will get the country object with dial code
            pickerButtonOnPress={(item: { flag: any; dial_code: any; }) => {
              setCountryCode(item.flag + item.dial_code);
              setShow(!show);
            }}
            onBackdropPress={() => setShow(!show)}
            lang={'en'}
            style={{modal: {height: 500}}}
          />
    </View>
  );
}
