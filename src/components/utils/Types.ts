/// <reference types="nativewind/types" />

export interface IndexProps {
  setIsLogged: (v: boolean) => void;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_KEY_NAME_PUBLIC: string;
      EXPO_PUBLIC_KEY_NAME_PRIVATE: string;
      EXPO_PUBLIC_SERVER_PUBLIC: string;
      EXPO_PUBLIC_API_URL: string;
      EXPO_PUBLIC_LIMITED_AUTH: string;
    }
  }
}
// export const env = dotenv.load({
//   EXPO_PUBLIC_KEY_NAME_PUBLIC: String,
//   EXPO_PUBLIC_KEY_NAME_PRIVATE: String,
//   EXPO_PUBLIC_SERVER_PUBLIC: String,
//   EXPO_PUBLIC_API_URL: String,
//   EXPO_PUBLIC_LIMITED_AUTH: String,
// });

export enum UserType {
  DOCTOR = "Doctor",
  PATIENT = "Patient",
}

export enum BirthSex {
  MALE = "Male",
  FEMALE = "Female",
  INTERSEX = "Intersex",
}

export interface SignupInfo {
  type?: UserType;
  number?: string;
  countryCode?: string;
  identification?: string;
  assignedSex?: BirthSex;
  preferedSex?: string;
}

export interface LoginInfo {
  type?: UserType;
  number?: string;
  identification?: string;
}

export interface SliderProps {
  options: string[];
  setOption: (v: string) => void;
  selected?: string;
}

export interface SignupProps {
  info: SignupInfo;
  setInfo: (v: SignupInfo) => void;
  index: number;
  setIndex: (v: number) => void;
  setIsLogged: (v: boolean) => void;
}

export interface LoginProps {
  info: LoginInfo;
  setInfo: (v: LoginInfo) => void;
  index: number;
  setIndex: (v: number) => void;
  setIsLogged: (v: boolean) => void;
}
export interface LoadingScreenProps {
  show: boolean;
  text: string;
}
