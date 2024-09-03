/// <reference types="nativewind/types" />

export interface IndexProps {
  setIsLogged: (v: boolean) => void;
}

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
  identification?: number;
  assignedSex?: BirthSex;
  preferedSex?: string;
}

export interface SliderProps {
  options: string[];
  setOption: (v: string) => void;
}
