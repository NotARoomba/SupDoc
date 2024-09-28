import { ObjectId } from "mongodb";

export default interface Comment {
  _id?: ObjectId;
  postId: string;
  parent: string | null; // D
  doctor: string; // D // DOCUMENT ID
  text: string; // R
  likes: string[]; // D
  reports: string[];
  replies: string[]; // OBJECT IDS OF COMMENTS
  timestamp: number; // D
}
