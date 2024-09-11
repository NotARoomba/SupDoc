import express, { Request, Response } from "express";
import {
  collections,
  createKey,
  encryption,
  env,
} from "../services/database.service";
import { STATUS_CODES } from "../models/util";
import { MongoCryptError, ObjectId } from "mongodb";
import {Doctor} from "../models/doctor";
import { createWorker } from "tesseract.js";

export const doctorsRouter = express.Router();

doctorsRouter.use(express.json());

doctorsRouter.get("/:id", async (req: Request, res: Response) => {
  const id = req?.params?.id;
  console.log(`Getting data for: ${id}`);
  try {
    let user: Doctor | null = null;
    if (collections.doctors) {
      //check if is a number
      user = (await collections.doctors.findOne({
        $or: [
          {
            identification: {
              number: await encryption.encrypt(
                !isNaN(parseFloat(id)) ? id : 0,
                {
                  algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
                  keyAltName: id,
                },
              ),
            },
          },
          { _id: new ObjectId(id) },
        ],
      })) as unknown as Doctor;
    }
    if (user) {
      res.status(200).send({ user, status: STATUS_CODES.SUCCESS });
    } else {
      res.status(404).send({
        user: null,
        status: STATUS_CODES.USER_NOT_FOUND,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(404).send({ status: STATUS_CODES.GENERIC_ERROR });
  }
});

doctorsRouter.post("/create", async (req: Request, res: Response) => {
  const data: Doctor<null> = req.body;
  // verification of id
  // const worker = await createWorker("eng");
  // const ret = await worker.recognize(data.identification.image);
  // await worker.terminate();
  // console.log(ret.data.text);
  // if (!ret.data.text.includes(data.identification.number.toString()))
  //   return res.status(200).send({ status: STATUS_CODES.INVALID_IDENTITY });
  const keyAltName = data.identification.number.toString(2);
  try {
    const keyUDID = await createKey(keyAltName);
    if (collections.doctors) {
      const ins = await collections.doctors.insertOne({
        number: await encryption.encrypt(data.number, {
          keyId: keyUDID,
          algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
        }),
        dateJoined: await encryption.encrypt(data.dateJoined, {
          keyAltName: keyAltName,
          algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
        }),
        publicKey: await encryption.encrypt(data.publicKey, {
          keyId: keyUDID,
          algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
        }),
        privateKey: await encryption.encrypt(data.privateKey, {
          keyAltName: env.KEY_ALIAS,
          algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
        }),

        // Identification fields
        identification: {
          license: await encryption.encrypt(data.identification.license, {
            keyId: keyUDID,
            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
          }),
          number: await encryption.encrypt(data.identification.number, {
            keyId: keyUDID,
            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
          }),
          isVerified: await encryption.encrypt(data.identification.isVerified, {
            keyId: keyUDID,
            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
          }),
        },
        comments: [],
        reports: []
      });
      res.send({ id: ins.insertedId, status: STATUS_CODES.SUCCESS });
    }
  } catch (error) {
    console.log(error);
    res.send({ status: STATUS_CODES.GENERIC_ERROR });
  }
});

doctorsRouter.post("/check", async (req: Request, res: Response) => {
  console.log(req.body)
  const id: number = req.body.id;
  const number: string = req.body.number;
  try {
    await createKey(id.toString(2))
  } catch {}
  try {
    let idUsers: Doctor[] = [];
    let numberUsers: Doctor[] = [];
    if (collections.doctors) {
      if (id) idUsers = (await collections.doctors
        .find({
          identification: {
            number: await encryption.encrypt(id, {
              algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
              keyAltName: id.toString(2),
            }),
          },
        })
        .toArray()) as unknown as Doctor[];
      if (number) numberUsers = (await collections.doctors
        .find({
          number: await encryption.encrypt(number, {
            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
            keyAltName: id.toString(2),
          }),
        })
        .toArray()) as unknown as Doctor[];
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

doctorsRouter.post("/keys", async (req: Request, res: Response) => {
  const id: number = parseInt(req.body.id);
  const number: string = req.body.number;
  try {
    await createKey(id.toString(2))
  } catch {}
  try {
    let idUser: Doctor;
    let numberUser: Doctor;
    if (collections.doctors) {
      idUser = (await collections.doctors
        .findOne({
          identification: {
            number: await encryption.encrypt(id, {
              algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
              keyAltName: id.toString(2),
            }),
          },
        })
        ) as unknown as Doctor;
      numberUser = (await collections.doctors
        .findOne({
          number: await encryption.encrypt(number, {
            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
            keyAltName: id.toString(2),
          }),
        })
        ) as unknown as Doctor;
        res.status(200).send({status: STATUS_CODES.SUCCESS, private: idUser ? idUser.privateKey : numberUser.privateKey, public: idUser ? idUser.publicKey : numberUser.publicKey})
    }
  } catch (error) {
    res.status(500).send({ status: STATUS_CODES.GENERIC_ERROR });
  }
});