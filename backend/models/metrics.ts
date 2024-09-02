import { Binary } from "mongodb";
import { ApplyConditionalType } from "./util";

export default interface Metrics<T = Binary | null>
  extends ApplyConditionalType<
    {
      age: number;
      height: number;
      weight: number;
      dob: string;
      sex: string;
      blood: string;
      pregnant: boolean;
    },
    T
  > {}
