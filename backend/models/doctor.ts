import { Binary } from "mongodb";
import { DoctorIdentification } from "./identification";
import Report from "./report";
import { UserBase } from "./user";

export interface Doctor extends UserBase {
  identification: DoctorIdentification; // M
  comments: string[]; // R
  reports: Report[]; // D
}
