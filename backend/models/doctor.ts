import { Binary } from "mongodb";
import { DoctorIdentification } from "./identification";
import Report from "./report";
import { UserBase } from "./user";
import { ApplyConditionalType } from "./util";
import { Specialty } from "./specialty";
import { DoctorMetrics } from "./metrics";

export interface Doctor extends UserBase {
  name: string;
  info: DoctorMetrics;
  identification: DoctorIdentification; // M
  comments: string[]; // R
  reports: Report[]; // D
}
