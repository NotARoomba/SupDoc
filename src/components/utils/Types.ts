/// <reference types="nativewind/types" />

import Comment from "@/backend/models/comment";
import Fact from "@/backend/models/fact";
import Post from "@/backend/models/post";
import { LanguageCodes, UserType } from "@/backend/models/util";
import { FlashList } from "@shopify/flash-list";
import { ObjectId } from "mongodb";
import { Ref } from "react";

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
      EXPO_PUBLIC_KEY_NAME_TYPE: string;
      EXPO_PUBLIC_KEY_NAME_PASS: string;
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

export enum BirthSex {
  MALE = "M",
  FEMALE = "F",
  INTERSEX = "IS",
}

export enum Sex {
  MALE = "M",
  FEMALE = "F",
  NONBINARY = "NB",
  OTHER = "O",
}

export enum GS {
  O = "O",
  A = "A",
  B = "B",
  AB = "AB",
}

interface BaseSignupInfo {
  password: string;
  passwordchk: string;
  number: string;
  countryCode: string;
  identification: string;
}

// Conditional type to extend the base signup interface based on UserType
export type SignupInfo<T extends UserType = UserType> = BaseSignupInfo &
  (T extends UserType.DOCTOR ? DoctorSignupInfo : PatientSignupInfo);

// Fields required for Doctor signup
export interface DoctorSignupInfo {
  firstName: string;
  lastName: string;
  specialty: string;
  experience: string;
  about: string;
  picture: string;
  license: string[]; // Required for doctors
  isVerified: boolean; // Required for doctors
}

// Fields required for Patient signup
export interface PatientSignupInfo {
  dob: number; // Required for patients
  weight: number; // Required for patients
  height: number; // Required for patients
  gs: string; // Required for patients
  rh: string; // Required for patients
  pregnant?: boolean;
  trans?: boolean;
  hormones?: boolean;
  surgery?: boolean;
  sex: BirthSex; // Required for patients
  altSex?: Sex;
}

// Base interface for shared login information
interface BaseLoginInfo {
  identification: string;
  password: string;
}

// Conditional type to extend the base login interface based on UserType
export type LoginInfo<T extends UserType = UserType> = BaseLoginInfo &
  (T extends UserType.DOCTOR ? DoctorLoginExtras : PatientLoginExtras);

// Additional fields required for Doctor login (if any in the future)
interface DoctorLoginExtras {
  // Add doctor-specific fields here, if necessary
}

// Additional fields required for Patient login (if any in the future)
interface PatientLoginExtras {
  // Add patient-specific fields here, if necessary
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
  userType: UserType;
  setIndex: (v: number) => void;
  setIsLogged: (v: boolean) => void;
}

export interface LoginProps {
  info: LoginInfo;
  setInfo: (v: LoginInfo) => void;
  index: number;
  userType: UserType;
  setIndex: (v: number) => void;
}
export interface LoadingScreenProps {
  show: boolean;
  text: string;
}

export interface ImageUploadProps {
  image: string;
  removeImage: (v: string) => void;
  activeDelete: boolean;
  setActiveDelete: (v: string) => void;
}

export interface HomeProps {
  userType: UserType;
}

export interface PostBlockProps {
  post: Post;
  userType: UserType;
  listRef?: Ref<FlashList<Post> | null>;
  saved?: boolean;
  blur?: boolean;
}

export interface CommentBlockProps {
  comments: Comment[];
  post: ObjectId;
  parent: ObjectId | null;
  replyingTo: ObjectId | null;
  setReplyingTo: (reply: ObjectId | null) => void;
}

type Language = {
  locale: LanguageCodes;
  name: string;
};

// Define the LANGUAGES array using the Language type
export const LANGUAGES: Language[] = [
  { locale: "en", name: "English" },
  { locale: "es", name: "Español" },
  { locale: "zh", name: "中文" },
  { locale: "hi", name: "हिन्दी" },
  { locale: "pt", name: "Português" },
  { locale: "ar", name: "العربية" },
  { locale: "fr", name: "Français" },
  { locale: "de", name: "Deutsch" },
  { locale: "ru", name: "Русский" },
  { locale: "ja", name: "日本語" },
  { locale: "ko", name: "한국어" },
  { locale: "it", name: "Italiano" },
];

export const LANGUAGE_COLORS: Record<LanguageCodes, string> = {
  en: "#071932",
  es: "#1e68d0",
  zh: "#023c4d",
  hi: "#b0ccf4",
  pt: "#6099e8",
  ar: "#1b7fdc",
  fr: "#124081",
  de: "#082540",
  ru: "#b1d4f5",
  ja: "#56d4fb",
  ko: "#06bcf4",
  it: "#047b9f",
};

export interface FunFactProps {
  fact: Fact;
}
