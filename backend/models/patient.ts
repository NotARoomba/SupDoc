import { Binary } from "mongodb";
import { Identification } from "./identification";
import { PatientMetrics } from "./metrics";
import { UserBase } from "./user";
import { ApplyConditionalType } from "./util";

export default interface Patient extends UserBase {
  identification: Identification; // M
  info: PatientMetrics; // R
  posts: string[]; // R
}
