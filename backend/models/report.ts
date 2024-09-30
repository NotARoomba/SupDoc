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

interface Reported {
  id: ObjectId;
  type: UserType | "Comment" | "Post";
}

export default interface Report {
  _id?: ObjectId;
  reported: Reported;
  reporter: Reporter;
  timestamp: number;
  parent?: ObjectId;
  reason: REPORT_REASONS;
  evidence?: string;
}
