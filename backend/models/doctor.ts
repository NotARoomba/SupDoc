import { Binary } from "mongodb";
import { DoctorIdentification } from "./identification";
import Report from "./report";
import { UserBase } from "./user";
import { ApplyConditionalType } from "./util";

export interface Doctor<T = Binary | null>
  extends UserBase<T>,
    ApplyConditionalType<
      {
        identification: DoctorIdentification<T>; // M
        comments: string[]; // R
        reports: Report<T>[]; // D
      },
      T
    > {}
