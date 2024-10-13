import { Doctor } from "@/backend/models/doctor";
import Patient from "@/backend/models/patient";
import { REPORT_REASONS } from "@/backend/models/report";
import STATUS_CODES from "@/backend/models/status";
import { User } from "@/backend/models/user";
import { UserType } from "@/backend/models/util";
import prompt from "@powerdesigninc/react-native-prompt";
import axios from "axios";
import CryptoJS from "crypto-es";
import { Base64 } from "crypto-es/lib/enc-base64";
import { reloadAppAsync } from "expo";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Alert, Platform } from "react-native";
import { RSA } from "react-native-rsa-native";
import { SignupInfo } from "./Types";

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
      return decryptKey
        ? JSON.parse(
            CryptoJS.AES.decrypt(res.body, decryptKey).toString(
              CryptoJS.enc.Utf8,
            ),
          )
        : res;
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

export async function uploadImages(imageUris: string[]) {
  try {
    // Create FormData
    // const key = CryptoJS.SHA256(CryptoJS.lib.WordArray.random(128/8)).toString();
    const formData = new FormData();
    for (const uri of imageUris) {
      // const base64Image = `data:image/png;base64,${await FileSystem.readAsStringAsync(uri, {
      //   encoding: FileSystem.EncodingType.Base64,
      // })}`;

      // const encryptedImage = CryptoJS.AES.encrypt(base64Image, key).toString();
      formData.append("files", {
        type: "image/png",
        uri,
        name: "files",
      } as unknown as File);
    }

    // Encrypt FormData
    // const data = formData; // FormData needs special handling for encryption
    // const key = CryptoJS.SHA256(JSON.stringify(formData)).toString();
    // const encryptedKey = await RSA.encrypt(
    //   key,
    //   process.env.EXPO_PUBLIC_SERVER_PUBLIC,
    // );
    // const encryptedData = CryptoJS.AES.encrypt(
    //   JSON.stringify(formData),
    //   key,
    // ).toString();
    // formData.append('key', encryptedKey)
    // const magic = JSON.stringify({ key: encryptedKey, data: encryptedData });
    // console.log(magic);
    // Handle authorization
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
    //change to b64
    // Make the API call
    const res = await axios.post(
      process.env.EXPO_PUBLIC_API_URL + "/images/upload",
      null,
      {
        data: formData,
        headers: {
          method: "POST",
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
          Authorization: authorization,
        },
        transformRequest: () => {
          return formData; // this is doing the trick
        },
      },
    );

    // Decrypt response
    const decryptKey = privateKey
      ? await RSA.decrypt(res.data.key, privateKey)
      : res.data.key;
    return decryptKey
      ? JSON.parse(
          CryptoJS.AES.decrypt(res.data.body, decryptKey).toString(
            CryptoJS.enc.Utf8,
          ),
        )
      : res.data;
  } catch (error: any) {
    console.log("UPLOAD ERROR", error);
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

export const isDoctorInfo = (
  userType: UserType,
  info: User,
): info is Doctor => {
  return userType === UserType.DOCTOR;
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

export function handleReport(
  userType: UserType,
  t: (locale: string) => string,
  isComment: boolean = true,
) {
  return new Promise<{ reason: REPORT_REASONS; evidence?: string }>(
    (resolve, reject) => {
      const options = [
        {
          text: t("report.inappropiateBehavior"),
          onPress: () =>
            resolve({ reason: REPORT_REASONS.INNAPROPRIATE_BEHAVIOUR }),
        },
        {
          text: t("report.spam"),
          onPress: () => resolve({ reason: REPORT_REASONS.SPAM }),
        },
        {
          text: t("buttons.cancel"),
          style: "cancel",
          onPress: () => reject("cancelled"),
        },
      ];

      // For comments, add the "Incorrect Information" option for doctors
      if (isComment) {
        options.unshift({
          text: t("report.incorrectInfo.title"),
          onPress: () => {
            if (userType === UserType.DOCTOR) {
              prompt(
                t("report.incorrectInfo.provide.title"),
                t("report.incorrectInfo.provide.description"),
                [
                  {
                    text: t("buttons.cancel"),
                    style: "cancel",
                    onPress: () => reject("cancelled"),
                  },
                  {
                    text: t("buttons.submit"),
                    onPress: (input) => {
                      if (validateScholarlyLink(input ?? "")) {
                        resolve({
                          reason: REPORT_REASONS.INCORRECT_INFORMATION,
                          evidence: input,
                        });
                      } else {
                        Alert.alert(
                          t("report.invalidLink.title"),
                          t("report.invalidLink.description"),
                        );
                        reject("invalid_link");
                      }
                    },
                  },
                ],
                "plain-text",
              );
            } else {
              resolve({ reason: REPORT_REASONS.INCORRECT_INFORMATION });
            }
          },
        });
      }

      Alert.alert(
        t("buttons.report"),
        t("report.description"),
        options as any,
        { cancelable: true },
      );
    },
  );
}

export function validateScholarlyLink(link: string) {
  const regex =
    /^(https?:\/\/)?(www\.)?(\w+\.)?([a-zA-Z0-9]+)\.[a-zA-Z]{2,}\/[^\s]+$/;
  return regex.test(link);
}

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      throw new Error(
        "Permission not granted to get push token for push notification!",
      );
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      throw new Error("Project ID not found");
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      return pushTokenString;
    } catch (e: unknown) {
      throw new Error(`${e}`);
    }
  } else {
    throw new Error("Must use physical device for push notifications");
  }
}
