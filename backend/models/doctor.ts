import { DoctorIdentification } from "./identification";
import Report from "./report";
import { UserBase } from "./user";

export interface Doctor extends UserBase {
  identification: DoctorIdentification;
  comments: string[];
  reports: Report[];
}
