import { DoctorIdentification } from "./identification";
import { DoctorMetrics } from "./metrics";
import Report from "./report";
import { UserBase } from "./user";

export interface Doctor extends UserBase {
  name: string;
  picture: string;
  info: DoctorMetrics;
  identification: DoctorIdentification; // M
  comments: string[]; // R
  reports: Report[]; // D
  saved: string[];
}
