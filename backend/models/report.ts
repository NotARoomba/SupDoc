import { Binary, ObjectId } from "mongodb";
import { ApplyConditionalType } from "./util";

enum REPORT_REASONS {
  INNAPROPRIATE_BEHAVIOUR,
  UNPROFESSIONAL_CONDUCT,
  FRADULENT_ACTIVITY,
  SPAM,
  IMPERSONATION,
}

export default interface Report<T = Binary | null>
  extends ApplyConditionalType<
    {
      _id: ObjectId;
      reporter: number;
      reason: REPORT_REASONS;
      proof: string;
    },
    T
  > {}
