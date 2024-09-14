import { Binary, ObjectId } from "mongodb";
import { Doctor } from "./doctor";
import Patient from "./patient";
import { ApplyConditionalType } from "./util";

export interface UserBase<T = Binary | null>
  extends ApplyConditionalType<
    {
      _id?: ObjectId;
      number: string; // D
      dateJoined: number; // D
      publicKey: string; // R
      privateKey: string; // R
    },
    T
  > {}

export type User = Patient<null> | Doctor<null>;
