import { ObjectId } from "mongodb";

export default interface Comment {
  _id?: ObjectId;
  post: string;
  parent:  ObjectId | null; // D
  doctor:  ObjectId; // D // DOCUMENT ID
  text: string; // R
  likes: ObjectId[]; // D
  reports: ObjectId[];
  replies:  ObjectId[]; // OBJECT IDS OF COMMENTS
  timestamp: number; // D
}
