import { ObjectId } from "mongodb";
import { LanguageCodes } from "./util";

export default interface Fact {
  _id?: ObjectId;
  text: { [locale in LanguageCodes]: string };
  likes: string[]; // D
  dislikes: string[];
  timestamp: number; // D
}
