import { ObjectId } from "mongodb";
import { UserType } from "./util";

enum REPORT_REASONS {
  INNAPROPRIATE_BEHAVIOUR,
  UNPROFESSIONAL_CONDUCT,
  FRADULENT_ACTIVITY,
  SPAM,
  IMPERSONATION,
}

interface Reporter {
  id: number;
  type: UserType;
}

export default interface Report {
  _id?: ObjectId;
  reported: ObjectId;
  reporter: Reporter;
  timestamp: number;
  reason?: REPORT_REASONS;
  proof?: string;
}
