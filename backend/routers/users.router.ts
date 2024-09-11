import express, { Request, Response } from "express";
import {
  collections,
  createKey,
  encryption,
  env,
} from "../services/database.service";
import { STATUS_CODES } from "../models/util";
import Patient from "../models/patient";
import { User } from "../models/user";

export const usersRouter = express.Router();

usersRouter.use(express.json());

usersRouter.post("/check", async (req: Request, res: Response) => {
  const id: number = req.body.id;
  const number: string = req.body.number;
  try {
    await createKey(id.toString(2));
  } catch {}
  try {
    let idUsers: User[] = [];
    let numberUsers: User[] = [];
    if (collections.patients && collections.doctors) {
      if (id)
        idUsers = (
          (await collections.patients
            .find({
              identification: {
                number: await encryption.encrypt(id, {
                  algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
                  keyAltName: id.toString(2),
                }),
              },
            })
            .toArray()) as unknown as User[]
        ).concat(
          (await collections.doctors
            .find({
              identification: {
                number: await encryption.encrypt(id, {
                  algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
                  keyAltName: id.toString(2),
                }),
              },
            })
            .toArray()) as unknown as User[],
        );
      if (number)
        numberUsers = (
          (await collections.patients
            .find({
              number: await encryption.encrypt(number, {
                algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
                keyAltName: id.toString(2),
              }),
            })
            .toArray()) as unknown as Patient[]
        ).concat(
          (await collections.doctors
            .find({
              number: await encryption.encrypt(number, {
                algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
                keyAltName: id.toString(2),
              }),
            })
            .toArray()) as unknown as Patient[],
        );
    }
    if (idUsers.length !== 0)
      return res.status(200).send({ status: STATUS_CODES.ID_IN_USE });
    else if (numberUsers.length !== 0)
      res.status(200).send({ status: STATUS_CODES.NUMBER_IN_USE });
    else res.status(200).send({ status: STATUS_CODES.NONE_IN_USE });
  } catch (error) {
    res.status(500).send({ status: STATUS_CODES.GENERIC_ERROR });
  }
});
