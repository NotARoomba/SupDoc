import { useTranslation } from "react-i18next";
import { Text, TextInput, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { LoginProps, UserType } from "../components/utils/Types";

export default function Login({ info, setInfo, index, userType }: LoginProps) {
  const { t } = useTranslation();
  return (
    <Animated.View entering={FadeIn.duration(500)} className="h-full ">
      <Animated.Text
        entering={FadeIn.duration(500)}
        key={index}
        className="text-5xl text-ivory font-bold text-center mb-8"
      >
        {t("titles.login")}
      </Animated.Text>
      {/* needs to show a text box to input a phone number and identificatio number */}
      <View>
        <Text className="text-center text-lg text-ivory  mt-4 font-semibold">
          {t("inputs.identification")}
          {userType == UserType.PATIENT && t("inputs.TI")}
        </Text>
        <TextInput
          onChangeText={(id) =>
            setInfo({
              ...info,
              identification: isNaN(parseInt(id)) ? 0 : parseInt(id),
            })
          }
          value={info.identification == 0 ? "" : info.identification.toString()}
          keyboardType="phone-pad"
          placeholderTextColor={"#ffffff"}
          className="flex justify-center align-middle  m-auto h-12 p-1 py-2.5 pl-3 text-xl  w-10/12   rounded-xl bg-rich_black text-ivory border border-powder_blue/20 font-semibold"
        />
        <Text className="text-center text-lg text-ivory  mt-4 font-semibold">
          {t("inputs.password")}
        </Text>
        <TextInput
          onChangeText={(pw) => setInfo({ ...info, password: pw })}
          value={info.password}
          passwordRules="required: upper; required: lower; required: digit; max-consecutive: 2; minlength: 8;"
          secureTextEntry
          keyboardType="default"
          placeholderTextColor={"#ffffff"}
          className="flex justify-center align-middle  m-auto h-12 p-1 py-2.5 pl-3 text-xl w-10/12   rounded-xl bg-rich_black text-ivory border border-powder_blue/20 font-semibold"
        />
      </View>
    </Animated.View>
  );
}
