import { ObjectId } from "mongodb";

export default interface Fact {
  _id?: ObjectId;
  text: string; // R
  likes: string[]; // D
  dislikes: string[];
  timestamp: number; // D
}
