import { ObjectId } from "mongodb";
import { DoctorIdentification } from "./identification";
import { DoctorMetrics } from "./metrics";
import { UserBase } from "./user";

export interface Doctor extends UserBase {
  name: string;
  picture: string;
  info: DoctorMetrics;
  identification: DoctorIdentification; // M
  comments: ObjectId[]; // R
  reports: ObjectId[]; // D
  saved: ObjectId[];
}
