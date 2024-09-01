import { Doctor } from "./doctor";
import Patient from "./patient";

export interface UserBase {
  _id: string;
  number: string;
  dateJoined: Date;
  publicKey: string;
  privateKey: string;
}

export type User = Patient | Doctor;
