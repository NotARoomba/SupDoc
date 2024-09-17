import { Identification } from "./identification";
import { PatientMetrics } from "./metrics";
import { UserBase } from "./user";

export default interface Patient extends UserBase {
  identification: Identification; // M
  info: PatientMetrics; // R
  posts: string[]; // R
}
