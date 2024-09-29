import { ObjectId } from "mongodb";
import Comment from "./comment";
import { PatientMetrics } from "./metrics";

export default interface Post {
  _id?: ObjectId;
  title: string; // D
  images: string[]; // R
  description: string;
  info: PatientMetrics;
  patient: number; // D // IDENTIFICATION NUMBER
  timestamp: number; // D
  comments: Comment[]; // M
  reports: ObjectId[];
}
