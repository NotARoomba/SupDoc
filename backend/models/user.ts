import { Binary } from "mongodb";
import { Doctor } from "./doctor";
import Patient from "./patient";

export interface UserBase {
  _id: string;
  number: string; // D
  dateJoined: Date; // D
  publicKey: string; // R
  privateKey: string; // R
}

export type User = Patient | Doctor;
