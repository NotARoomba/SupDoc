import { Binary } from "mongodb";

enum IdentificationType {
  TI,
  CEDULA,
}
export interface Identification {
  type: IdentificationType; // D
  number: number; // D
  image: string; // R
}

export interface DoctorIdentification extends Identification {
  license: string; // R
  isVerified: boolean; // D
}
