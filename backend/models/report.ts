import { ObjectId } from "mongodb";
import { UserType } from "./util";

export enum REPORT_REASONS {
  INCORRECT_INFORMATION,
  INNAPROPRIATE_BEHAVIOUR,
  SPAM,
}

interface Reporter {
  id: ObjectId;
  type: UserType;
}

export default interface Report {
  _id?: ObjectId;
  reported: ObjectId;
  reporter: Reporter;
  timestamp: number;
  parent?: ObjectId,
  reason: REPORT_REASONS;
  evidence?: string;
}
