import { ObjectId } from "mongodb";

export default interface Post {
  _id?: ObjectId;
  title: string; // D
  images: string[]; // R
  description: string;
  patient: number; // D // IDENTIFICATION NUMBER
  timestamp: number; // D
  comments: string[]; // M
  reports: string[];
}
