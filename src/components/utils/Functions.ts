import { STATUS_CODES } from "@/backend/models/util";
import CryptoJS from "crypto-es";
import { RSA } from "react-native-rsa-native";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { SignupInfo, UserType } from "./Types";
import { Base64 } from "crypto-es/lib/enc-base64";
import { reloadAppAsync } from "expo";
import { User } from "@/backend/models/user";
import Patient from "@/backend/models/patient";
import { SplashScreen } from "expo-router";

export async function callAPI(
  endpoint: string,
  method: string,
  body: object = {},
) {
  try {
    // return { status: STATUS_CODES.NONE_IN_USE };
    const data = JSON.stringify(body);
    const key = CryptoJS.SHA256(data).toString();
    const encryptedKey = await RSA.encrypt(
      key,
      process.env.EXPO_PUBLIC_SERVER_PUBLIC,
    );
    const encryptedData = CryptoJS.AES.encrypt(data, key).toString();
    const magic = JSON.stringify({ key: encryptedKey, data: encryptedData });
    const publicKey = await SecureStore.getItemAsync(
      process.env.EXPO_PUBLIC_KEY_NAME_PUBLIC,
    );
    const privateKey = await SecureStore.getItemAsync(
      process.env.EXPO_PUBLIC_KEY_NAME_PRIVATE,
    );
    let encryptedAuth = publicKey ?? process.env.EXPO_PUBLIC_LIMITED_AUTH;
    const authKey = CryptoJS.SHA256(encryptedAuth).toString();
    const authorization = Base64.stringify(
      CryptoJS.enc.Utf8.parse(
        JSON.stringify({
          key: (
            await RSA.encrypt(authKey, process.env.EXPO_PUBLIC_SERVER_PUBLIC)
          )
            .replace(/\s+/g, "")
            .replace("\n", ""),
          data: CryptoJS.AES.encrypt(encryptedAuth, authKey).toString(),
        }),
      ),
    );
    // console.log(CryptoJS.enc.Utf8.parse(authorization).toString(CryptoJS.enc.Utf8))
    // // const authorization = (await RSA.encrypt(((privateKey && password) ? CryptoJS.AES.encrypt(privateKey, password).toString() : process.env.EXPO_PUBLIC_LIMITED_AUTH), process.env.EXPO_PUBLIC_SERVER_PUBLIC)).replace(/\s+/g, "")
    // // .replace("\n", "");
    // console.log(CryptoJS.AES.encrypt(encryptedPriv, authKey).toString())
    // console.log(authorization)
    try {
      const res =
        method === "POST"
          ? (
              await axios.post(
                process.env.EXPO_PUBLIC_API_URL + endpoint,
                magic,
                {
                  method: method,
                  headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: authorization,
                  },
                },
              )
            ).data
          : (
              await axios.get(process.env.EXPO_PUBLIC_API_URL + endpoint, {
                method: method,
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                  Authorization: authorization,
                },
              })
            ).data;
      const decryptKey = privateKey
        ? await RSA.decrypt(res.key, privateKey)
        : res.key;
      return JSON.parse(
        CryptoJS.AES.decrypt(res.body, decryptKey).toString(CryptoJS.enc.Utf8),
      );
    } catch (error: any) {
      console.log(error);
      if (!error.response) return { status: STATUS_CODES.NO_CONNECTION };
      // Alert.alert('Error!', 'No podemos conectar a nuestro servidor! Revisa tu conexion al internet.')
      return {
        status: STATUS_CODES.GENERIC_ERROR,
      };
    }
  } catch (error: any) {
    console.log("REQUEST ERROR", error);
    return {
      status: STATUS_CODES.GENERIC_ERROR,
    };
  }
}

export const isPatientSignupInfo = (
  userType: UserType,
  info: SignupInfo<UserType>,
): info is SignupInfo<UserType.PATIENT> => {
  return userType === UserType.PATIENT;
};

export const isPatientInfo = (
  userType: UserType,
  info: User,
): info is Patient => {
  return userType === UserType.PATIENT;
};

// Type guard to check if info is of type SignupInfo<UserType.DOCTOR>
export const isDoctorSignupInfo = (
  userType: UserType,
  info: SignupInfo<UserType>,
): info is SignupInfo<UserType.DOCTOR> => {
  return userType === UserType.DOCTOR;
};

export async function logout() {
  await SecureStore.deleteItemAsync(process.env.EXPO_PUBLIC_KEY_NAME_PRIVATE);
  await SecureStore.deleteItemAsync(process.env.EXPO_PUBLIC_KEY_NAME_PUBLIC);
  await SecureStore.deleteItemAsync(process.env.EXPO_PUBLIC_KEY_NAME_TYPE);
  await SecureStore.deleteItemAsync(process.env.EXPO_PUBLIC_KEY_NAME_PASS);
  reloadAppAsync();
}
