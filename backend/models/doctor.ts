import { Binary } from "mongodb";
import { DoctorIdentification } from "./identification";
import Report from "./report";
import { UserBase } from "./user";
import { ApplyConditionalType } from "./util";
import { Specialty } from "./specialty";

export interface Doctor
  extends UserBase{
        name: string,
        identification: DoctorIdentification; // M
        comments: string[]; // R
        reports: Report[]; // D
      } {}

