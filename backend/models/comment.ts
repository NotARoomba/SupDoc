import { Binary, ObjectId } from "mongodb";
import { ApplyConditionalType } from "./util";
import Report from "./report";

export default interface Comment {
  _id?: ObjectId;
  postId: string;
  parent?: string; // D
  doctor: number; // D // IDENTIFICATION NUMBER
  text: string; // R
  likes: string[]; // D
  reports: string[];
  children: string[]; // OBJECT IDS OF COMMENTS
  timestamp: number; // D
}
