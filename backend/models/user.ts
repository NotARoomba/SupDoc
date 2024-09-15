import { Binary, ObjectId } from "mongodb";
import { Doctor } from "./doctor";
import Patient from "./patient";
import { ApplyConditionalType } from "./util";

export interface UserBase {
  _id?: ObjectId;
  number: string; // D
  dateJoined: number; // D
  publicKey: string; // R
  privateKey: string; // R
}

export type User = Patient | Doctor;
