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

export enum UserType {
  DOCTOR = "Doctor",
  PATIENT = "Patient",
}

export enum BirthSex {
  MALE = "M",
  FEMALE = "F",
  INTERSEX = "IS",
}

export enum Sex {
  MALE = "M",
  FEMALE = "F",
  INTERSEX = "IS",
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
  identification: number;
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
  identification: number;
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
