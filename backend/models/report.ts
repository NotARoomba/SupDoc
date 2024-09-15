import { Binary, ObjectId } from "mongodb";
import { ApplyConditionalType } from "./util";

enum REPORT_REASONS {
  INNAPROPRIATE_BEHAVIOUR,
  UNPROFESSIONAL_CONDUCT,
  FRADULENT_ACTIVITY,
  SPAM,
  IMPERSONATION,
}

export default interface Report {
  _id: ObjectId;
  reporter: number;
  reason: REPORT_REASONS;
  proof: string;
}
