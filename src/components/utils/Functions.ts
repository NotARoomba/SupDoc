import { STATUS_CODES } from "@/backend/models/util";
import CryptoJS from "crypto-es";
import { RSA } from "react-native-rsa-native";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { SignupInfo, UserType } from "./Types";

export async function callAPI(
  endpoint: string,
  method: string,
  body: object = {},
) {
  try {
    const data = JSON.stringify(body);
    const key = CryptoJS.SHA256(data).toString();
    const encryptedKey = await RSA.encrypt(
      key,
      process.env.EXPO_PUBLIC_SERVER_PUBLIC,
    );
    const encryptedData = CryptoJS.AES.encrypt(data, key).toString();
    const magic = JSON.stringify({ key: encryptedKey, data: encryptedData });
    const privateKey = await SecureStore.getItemAsync(
      process.env.EXPO_PUBLIC_KEY_NAME_PRIVATE,
    );
    const password = await SecureStore.getItemAsync(
      process.env.EXPO_PUBLIC_KEY_NAME_PASS,
    )
    //private key should be encrypted with password
    const authorization = (
      await RSA.encrypt(
        (privateKey && password) ? CryptoJS.AES.encrypt(privateKey, password).toString() : process.env.EXPO_PUBLIC_LIMITED_AUTH,
        process.env.EXPO_PUBLIC_SERVER_PUBLIC,
      )
    )
      .replace(/\s+/g, "")
      .replace("\n", "");
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

export const isPatientInfo = (
  userType: UserType,
  info: SignupInfo<UserType>,
): info is SignupInfo<UserType.PATIENT> => {
  return userType === UserType.PATIENT;
};

// Type guard to check if info is of type SignupInfo<UserType.DOCTOR>
export const isDoctorInfo = (
  userType: UserType,
  info: SignupInfo<UserType>,
): info is SignupInfo<UserType.DOCTOR> => {
  return userType === UserType.DOCTOR;
};
