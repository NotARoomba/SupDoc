import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SignupProps, UserType } from "../components/utils/Types";
import React, { useEffect, useState } from "react";
import { CountryPicker } from "react-native-country-codes-picker";
import { callAPI } from "../components/utils/Functions";
import Spinner from "react-native-loading-spinner-overlay";
import Loader from "components/misc/Loader";
import LoadingScreen from "components/misc/LoadingScreen";

export default function Signup({
  info,
  index,
  setIndex,
  setInfo,
  setIsLogged,
}: SignupProps) {
  /// setInfo({...info, info.(PROPIEDAD Q QUIERES CAMBIAR)})
  const [show, setShow] = useState(false);
  const [countryCode, setCountryCode] = useState("🇨🇴+57");
  const [loading, setIsLoading] = useState(false);

  useEffect(() => {
    if (index == 3) {
      // setInfo({...info, countryCode: countryCode})
      // check if number and id dont exist
      setIsLoading(true);
    }
  }, [index]);
  return (
    <View className="h-full ">
      {index == 2 ? (
        <View>
          {/* needs to show a text box to input a phone number and identificatio number */}
          <Text className="text-center text-lg text-ivory -mb-3 font-semibold">
            Phone Number
          </Text>
          <View className="flex flex-row justify-center m-auto align-middle  ">
            <TouchableOpacity
              onPress={() => setShow(!show)}
              className=" bg-rich_black border border-powder_blue/20 border-r-0 text-center align-middle p-1 h-12 mt-3 w-3/12 rounded-l-xl"
            >
              <Text className="align-middle m-auto text-lg text-ivory font-semibold">
                {countryCode}
              </Text>
            </TouchableOpacity>
            <TextInput
              onChangeText={(n) => setInfo({ ...info, number: n })}
              value={info.number}
              keyboardType="phone-pad"
              placeholderTextColor={"#ffffff"}
              className="flex justify-center align-middle  my-auto ml-0 h-12 p-1 py-2.5 pl-3 text-xl mt-3 w-8/12   rounded-xl rounded-l-none bg-rich_black text-ivory border border-powder_blue/20 font-semibold"
            />
          </View>
          <Text className="text-center text-lg text-ivory -mb-3 mt-3 font-semibold">
            Cedula/TI
          </Text>
          <TextInput
            onChangeText={(id) => setInfo({ ...info, identification: id })}
            value={info.identification}
            keyboardType="phone-pad"
            placeholderTextColor={"#ffffff"}
            className="flex justify-center align-middle  m-auto h-12 p-1 py-2.5 pl-3 text-xl mt-3 w-11/12   rounded-xl bg-rich_black text-ivory border border-powder_blue/20 font-semibold"
          />
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
        pickerButtonOnPress={(item: { flag: any; dial_code: any }) => {
          setCountryCode(item.flag + item.dial_code);
          setInfo({ ...info, countryCode: item.dial_code });
          setShow(!show);
        }}
        enableModalAvoiding
        // androidWindowSoftInputMode={"pan"}
        onBackdropPress={() => setShow(!show)}
        lang={"en"}
        style={{
          modal: { height: "50%", backgroundColor: "#041225" },
          countryButtonStyles: {
            backgroundColor: "#041225",
            borderColor: "rgba(180, 197, 228, 0.1)",
            borderWidth: 1,
          },
          searchMessageText: { color: "#fbfff1" },
          textInput: {
            backgroundColor: "#041225",
            borderColor: "rgba(180, 197, 228, 0.3)",
            borderWidth: 1,
            paddingLeft: 10,
          },
          countryName: { color: "#fbfff1" },
          dialCode: { color: "#fbfff1" },
          line: { backgroundColor: "rgba(180, 197, 228, 0.2)" },
        }}
      />
      <LoadingScreen text="Loading" show={loading} />
      {/* <Spinner
          visible={loading}
          overlayColor="#00000099"
          textContent={"Loading"}
          customIndicator={<Loader />}
          textStyle={{color: '#fff', marginTop: -50}}
          animation="fade"
        /> */}
    </View>
  );
}
