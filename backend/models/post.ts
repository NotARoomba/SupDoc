import { Binary } from "mongodb";
import Comment from "./comment";

export default interface Post {
  _id: string;
  title: string; // D
  images: string[]; // R
  description: string;
  patient: string; // D
  timestamp: number; // D
  comments: Comment[]; // M
}
