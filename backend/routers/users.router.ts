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

export const usersRouter = express.Router();

usersRouter.use(express.json());

usersRouter.post("/check", async (req: Request, res: Response) => {
  const id: number = req.body.id;
  const number: string = req.body.number;
  try {
    await createKey([id.toString(2), number.split('').map(bin => String.fromCharCode(parseInt(bin, 2))).join('')]);
  } catch {}
  try {
    let user: User | null = null;
    if (collections.patients && collections.doctors) {
      user = ((await collections.patients.findOne({
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
            number: await encryption.encrypt(number, {
              algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
              keyAltName: id.toString(2),
            }),
          },
        ],
      })) ??
        (await collections.doctors.findOne({
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
              number: await encryption.encrypt(number, {
                algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
                keyAltName: id.toString(2),
              }),
            },
          ],
        }))) as User;
    }
    if (user) return res.status(200).send({ status: STATUS_CODES.ID_IN_USE });
    else if (user) res.status(200).send({ status: STATUS_CODES.NUMBER_IN_USE });
    else res.status(200).send({ status: STATUS_CODES.NONE_IN_USE });
  } catch (error) {
    res.status(500).send({ status: STATUS_CODES.GENERIC_ERROR });
  }
});

usersRouter.post("/keys", async (req: Request, res: Response) => {
    const id: number = parseInt(req.body.id);
    const number: string = req.body.number;
    const userType: UserType = req.body.userType;
    try {
      await createKey([id.toString(2), number.split('').map(bin => String.fromCharCode(parseInt(bin, 2))).join('')]);
    } catch {}
    try {
    let idUser: User;
    let numberUser: User;
      if (collections.patients && collections.doctors) {
        idUser =  (userType == UserType.PATIENT?  (await collections.patients.findOne({
          identification: {
            number: await encryption.encrypt(id, {
              algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
              keyAltName: id.toString(2),
            }),
          },
        })) : (await collections.doctors.findOne({
            identification: {
              number: await encryption.encrypt(id, {
                algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
                keyAltName: id.toString(2),
              }),
            },
          }))) as unknown as User;
        numberUser =   (userType == UserType.PATIENT? (await collections.patients.findOne({
          number: await encryption.encrypt(number, {
            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
            keyAltName: id.toString(2),
          }),
        })) : (await collections.doctors.findOne({
            number: await encryption.encrypt(number, {
              algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
              keyAltName: id.toString(2),
            }),
          }))) as unknown as User;
          res.status(200).send({
            status: STATUS_CODES.SUCCESS,
            private: idUser ? idUser.privateKey : numberUser.privateKey,
            public: idUser ? idUser.publicKey : numberUser.publicKey,
          });
      }
    } catch (error) {
      res.status(500).send({ status: STATUS_CODES.GENERIC_ERROR });
    }
  });
