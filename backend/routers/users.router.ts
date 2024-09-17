import express, { Request, Response } from "express";
import {
  collections,
  createKey,
  encryption,
  env,
} from "../services/database.service";
import { STATUS_CODES, UserType } from "../models/util";
import Patient from "../models/patient";
import { User } from "../models/user";
import { encrypt } from "../services/encryption.service";
import { MongoCryptError } from "mongodb";

export const usersRouter = express.Router();

usersRouter.use(express.json());

usersRouter.post("/check", async (req: Request, res: Response) => {
  const id: number = req.body.id;
  const number: string | null = req.body.number;
  try {
    let user: User | null = null;
    if (collections.patients && collections.doctors) {
      user =
        (await collections.doctors.findOne({
          $or: [
            {
              identification: {
                number: id,
              },
            },
            {
              number: number ?? "",
            },
          ],
        })) ??
        ((await collections.patients.findOne({
          $or: [
            {
              identification: {
                number: await encryption.encrypt(id, {
                  algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
                  keyAltName: id.toString(2),
                }),
              },
            },
            {
              number: await encryption.encrypt(number ?? "", {
                algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
                keyAltName: id.toString(2),
              }),
            },
          ],
        })) as User);
    }
    if (user) return res.status(200).send({ status: STATUS_CODES.ID_IN_USE });
    else if (user) res.status(200).send({ status: STATUS_CODES.NUMBER_IN_USE });
    else res.status(200).send({ status: STATUS_CODES.NONE_IN_USE });
  } catch (error) {
    if (error instanceof MongoCryptError) {
      return res.status(200).send({ status: STATUS_CODES.NONE_IN_USE });
    }
    res.status(200).send({ status: STATUS_CODES.GENERIC_ERROR });
  }
});

usersRouter.post("/keys", async (req: Request, res: Response) => {
  const id: number = parseInt(req.body.id);
  const number: string = req.body.number;
  // try {
  //   await createKey([
  //     id.toString(2),
  //     number
  //       .split("")
  //       .map((bin) => String.fromCharCode(parseInt(bin, 2)))
  //       .join(""),
  //   ]);
  // } catch {}
  try {
    let user: User;
    if (collections.patients && collections.doctors) {
      user =
        (await collections.doctors.findOne({
          $or: [
            {
              identification: {
                number: id,
              },
            },
            {
              number: number ?? "",
            },
          ],
        })) ??
        ((await collections.patients.findOne({
          $or: [
            {
              identification: {
                number: await encryption.encrypt(id, {
                  algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
                  keyAltName: id.toString(2),
                }),
              },
            },
            {
              number: await encryption.encrypt(number ?? "", {
                algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
                keyAltName: id.toString(2),
              }),
            },
          ],
        })) as User);
        console.log(user)
      if (!user)
        return res.status(200).send({ status: STATUS_CODES.USER_NOT_FOUND });
      res.status(200).send({
        status: STATUS_CODES.SUCCESS,
        private: user.privateKey,
        public: user.publicKey,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(200).send({ status: STATUS_CODES.GENERIC_ERROR });
  }
});
