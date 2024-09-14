import { Binary } from "mongodb";
import { Identification } from "./identification";
import {PatientMetrics} from "./metrics";
import { UserBase } from "./user";
import { ApplyConditionalType } from "./util";

export default interface Patient<T = Binary | null>
  extends UserBase<T>,
    ApplyConditionalType<
      {
        identification: Identification<T>; // M
        info: PatientMetrics<T>; // R
        posts: string[]; // R
      },
      T
    > {}
