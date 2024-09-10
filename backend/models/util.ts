import { Binary } from "mongodb";

export enum STATUS_CODES {
  SUCCESS,
  GENERIC_ERROR,
  USER_NOT_FOUND,
  TOO_MANY_ATTEMPTS,
  INVALID_NUMBER,
  SENT_CODE,
  NUMBER_NOT_EXIST,
  ERROR_SENDING_CODE,
  CODE_DENIED,
  CODE_EXPIRED,
  CODE_FAILED,
  NO_CONNECTION,
  ID_IN_USE,
  NUMBER_IN_USE,
  NONE_IN_USE,
  INVALID_IDENTITY,
  COMMENT_LIMIT_REACHED,
  DOES_NOT_EXIST,
}

type ConditionalType<T, U> = T extends Binary ? T : U;

export type ApplyConditionalType<T, U> = {
  [K in keyof T]: K extends "_id"
    ? T[K] // Do not apply ConditionalType to _id
    : T[K] extends Array<infer R> // Check if T[K] is an array
      ? Array<ConditionalType<U, R>> // Apply ConditionalType to the array's elements, but keep the array itself
      : T[K] extends object
        ? // ? ApplyConditionalType<T[K], U> // Recursively apply the conditional type to nested objects
          T[K] // Recursively apply the conditional type to nested objects
        : ConditionalType<U, T[K]>; // Apply the conditional type to the field if it's a primitive
};

export enum UserType {
  DOCTOR = "Doctor",
  PATIENT = "Patient",
}