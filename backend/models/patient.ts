import { Identification } from "./identification";
import Metrics from "./metrics";
import { UserBase } from "./user";

export default interface Patient extends UserBase {
  identification: Identification;
  info: Metrics;
  posts: string[];
}
