import { Binary, ObjectId } from "mongodb";
import Comment from "./comment";
import { ApplyConditionalType } from "./util";

export default interface Post<T = Binary | null>
  extends ApplyConditionalType<
    {
      _id?: ObjectId;
      title: string; // D
      images: string[]; // R
      description: string;
      patient: number; // D // IDENTIFICATION NUMBER
      timestamp: number; // D
      comments: string[]; // M
      reports: string[];
    },
    T
  > {}
