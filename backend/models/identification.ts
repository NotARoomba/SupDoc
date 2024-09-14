import { Binary } from "mongodb";
import { ApplyConditionalType } from "./util";

enum IdentificationType {
  TI,
  CEDULA,
}
export interface Identification<T = Binary | null>
  extends ApplyConditionalType<
    {
      // type: number; // D
      number: number; // D
      // image: string; // R
    },
    T
  > {}

export interface DoctorIdentification<T = Binary | null>
  extends Identification<T>,
    ApplyConditionalType<
      {
        number: number;
        license: string[]; // R
        isVerified: boolean; // D
      },
      T
    > {}
