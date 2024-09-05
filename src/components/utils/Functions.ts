import { STATUS_CODES } from "@/backend/models/util";
import CryptoJS from "crypto-es";
//import Forge from "node-forge";
import { RSA } from "react-native-rsa-native";
import * as SecureStore from "expo-secure-store";

export async function callAPI(
  endpoint: string,
  method: string,
  body: object = {},
) {
  try {
    
  const data = JSON.stringify(body);
  const key = CryptoJS.SHA256(data).toString();
  //Forge.pki.rsa.setPrivateKey(process.env.EXPO_PUBLIC_SERVER_PUBLIC)
  console.log(process.env.EXPO_PUBLIC_SERVER_PUBLIC)
  const encryptedKey = await RSA.encrypt(
    key,
    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAswOh8NJMFTZf7qb/9AxSnFic23PL6UWHrsr+RTMYG+L3LjfbajPkzNb52oJIPlvbS/EogwkkJmWLiP27wOFvK9+I7YjHWnU9zISsCF6l9aZCXG6np3BZFIwlUiM4LM1wVQY1Gt8HRYLnKm0ogMVjvsW8cc+oVfXI1QR9VIn9IPJFeraYQX3tEaK2wHabb0lXKB0GL8H5nZrABl30vK+qjpkGTuJwr3Gf3Y0daEpWxM1bIC5LVYPNgh2QLJAqm86p1jdwziGV3cphpsgIFfLN2F2rJz3jLTQ0iRSdyzeqrPY7uH+RQLbGHc8PsdG5allvfXUar2e2oaW7M68NERW24wIDAQAB",
  );
  console.log("ASDASD")
  const encryptedData = CryptoJS.AES.encrypt(data, key).toString();
  const magic = JSON.stringify({ key: encryptedKey, data: encryptedData });
  //private key should be encrypted with password
  const authorization = (
    await RSA.encrypt(
      (await SecureStore.getItemAsync(
        process.env.EXPO_PUBLIC_KEY_NAME_PRIVATE,
      )) ?? process.env.EXPO_PUBLIC_LIMITED_AUTH,
      process.env.EXPO_PUBLIC_SERVER_PUBLIC,
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
          await fetch(process.env.EXPO_PUBLIC_API_URL + endpoint, {
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
