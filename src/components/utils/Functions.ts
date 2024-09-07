import { STATUS_CODES } from "@/backend/models/util";
import CryptoJS from "crypto-es";
//import Forge from "node-forge";
import { RSA } from "react-native-rsa-native";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
function formatRSAKey(key: string): string {
  // Add newline after '-----BEGIN PUBLIC KEY-----'
  key = key.replace(/(-----BEGIN PUBLIC KEY-----)/, "$1\n");

  // Add newline before '-----END PUBLIC KEY-----'
  key = key.replace(/(-----END PUBLIC KEY-----)/, "\n$1");

  // Insert newline after every 64 characters (non-whitespace sequence)
  key = key.replace(/(\S{64})/g, "$1\n");

  return key;
}
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
      Platform.OS === "android"
        ? process.env.EXPO_PUBLIC_SERVER_PUBLIC
        : "-----BEGIN PUBLIC KEY-----" +
            process.env.EXPO_PUBLIC_SERVER_PUBLIC +
            "-----END PUBLIC KEY-----",
    );
    const encryptedData = CryptoJS.AES.encrypt(data, key).toString();
    const magic = JSON.stringify({ key: encryptedKey, data: encryptedData });
    //private key should be encrypted with password
    const authorization = (
      await RSA.encrypt(
        (await SecureStore.getItemAsync(
          process.env.EXPO_PUBLIC_KEY_NAME_PRIVATE,
        )) ?? process.env.EXPO_PUBLIC_LIMITED_AUTH,
        Platform.OS === "android"
        ? process.env.EXPO_PUBLIC_SERVER_PUBLIC
        : "-----BEGIN PUBLIC KEY-----" +
            process.env.EXPO_PUBLIC_SERVER_PUBLIC +
            "-----END PUBLIC KEY-----",
      )
    ).toString();
    try {
      return method === "POST"
        ? await (
            await fetch(process.env.EXPO_PUBLIC_API_URL + endpoint, {
              method: method,
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: authorization,
              },
              body: magic,
            })
          ).json()
        : await (
            await fetch("http://192.168.1.66:3001" + endpoint, {
              method: method,
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: authorization,
              },
            })
          ).json();
    } catch (error: any) {
      console.log(error);
      if (!error.response) return { status: STATUS_CODES.NO_CONNECTION };
      // Alert.alert('Error!', 'No podemos conectar a nuestro servidor! Revisa tu conexion al internet.')
      return {
        status: STATUS_CODES.GENERIC_ERROR,
      };
    }
  } catch (error: any) {
    console.log(error);
  }
}
