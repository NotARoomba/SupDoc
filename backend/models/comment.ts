import { ObjectId } from "mongodb";

export default interface Comment {
  _id: ObjectId;
  name: string; // NAME OF DOCTOR OR UNKNOWN
  commenter: ObjectId; // D // DOCUMENT ID
  parent: ObjectId | null;
  text: string; // R
  likes: ObjectId[]; // D
  reports: ObjectId[];
  replies: Comment[]; // OBJECT IDS OF COMMENTS
  timestamp: number; // D
}
