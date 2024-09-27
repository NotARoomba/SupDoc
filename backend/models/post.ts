import { ObjectId } from "mongodb";
import { PatientMetrics } from "./metrics";

export default interface Post {
  _id?: ObjectId;
  title: string; // D
  images: string[]; // R
  description: string;
  info: PatientMetrics;
  patient: number; // D // IDENTIFICATION NUMBER
  timestamp: number; // D
  comments: string[]; // M
  reports: string[];
}
