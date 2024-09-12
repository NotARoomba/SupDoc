import { Binary, ObjectId } from "mongodb";
import { ApplyConditionalType } from "./util";
import Report from "./report";

export default interface Fact {
      _id?: ObjectId;
      text: string; // R
      likes: string[]; // D
      dislikes: string[];
      timestamp: number; // D
    }
