import { ObjectId } from "mongodb";
import { PatientMetrics } from "./metrics";
import Comment from "./comment";

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
