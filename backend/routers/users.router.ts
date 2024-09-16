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

export const usersRouter = express.Router();

usersRouter.use(express.json());

usersRouter.post("/check", async (req: Request, res: Response) => {
  const id: number = req.body.id;
  const number: string | null = req.body.number;
  try {
    if (
      number 
      
    ) {
      const exists = (await encryption.getKeyByAltName(
        number
          .split("")
          .map((bin) => bin.charCodeAt(0).toString(2))
          .join(""),
      ))
      console.log(exists, number
        .split("")
        .map((bin) => bin.charCodeAt(0).toString(2))
        .join(""))
      if (!exists) await createKey([
        id.toString(2),
        number
          .split("")
          .map((bin) => bin.charCodeAt(0).toString(2))
          .join(""),
      ]);
    }
  } catch (e) { console.log(e); }
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
            number: await encryption.encrypt(number ?? "", {
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
                number: id,
              },
            },
            {
              number: number ?? "",
            },
          ],
        }))) as User;
    }
    if (user) return res.status(200).send({ status: STATUS_CODES.ID_IN_USE });
    else if (user) res.status(200).send({ status: STATUS_CODES.NUMBER_IN_USE });
    else res.status(200).send({ status: STATUS_CODES.NONE_IN_USE });
  } catch (error) {
    console.log(error);
    res.status(200).send({ status: STATUS_CODES.GENERIC_ERROR });
  }
});

usersRouter.post("/keys", async (req: Request, res: Response) => {
  const id: number = parseInt(req.body.id);
  const number: string = req.body.number;
  const userType: UserType = req.body.userType;
  try {
    await createKey([
      id.toString(2),
      number
        .split("")
        .map((bin) => String.fromCharCode(parseInt(bin, 2)))
        .join(""),
    ]);
  } catch {}
  try {
    let idUser: User;
    let numberUser: User;
    if (collections.patients && collections.doctors) {
      idUser = (userType == UserType.PATIENT
        ? await collections.patients.findOne({
            identification: {
              number: await encryption.encrypt(id, {
                algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
                keyAltName: id.toString(2),
              }),
            },
          })
        : await collections.doctors.findOne({
            identification: {
              number: id,
            },
          })) as unknown as User;
      numberUser = (userType == UserType.PATIENT
        ? await collections.patients.findOne({
            number: await encryption.encrypt(number, {
              algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
              keyAltName: id.toString(2),
            }),
          })
        : await collections.doctors.findOne({
            number,
          })) as unknown as User;
      if (!numberUser && !idUser)
        return res.status(200).send({ status: STATUS_CODES.USER_NOT_FOUND });
      res.status(200).send({
        status: STATUS_CODES.SUCCESS,
        private: idUser ? idUser.privateKey : numberUser.privateKey,
        public: idUser ? idUser.publicKey : numberUser.publicKey,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(200).send({ status: STATUS_CODES.GENERIC_ERROR });
  }
});
