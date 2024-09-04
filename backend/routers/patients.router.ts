import express, { Request, Response } from "express";
import {
  collections,
  createKey,
  encryption,
  env,
} from "../services/database.service";
import { STATUS_CODES } from "../models/util";
import { ObjectId } from "mongodb";
import Patient from "../models/patient";
import { createWorker } from "tesseract.js";

export const patientsRouter = express.Router();

patientsRouter.use(express.json());

patientsRouter.get("/:id", async (req: Request, res: Response) => {
  const id = req?.params?.id;
  console.log(`Getting data for: ${id}`);
  try {
    let user: Patient | null = null;
    if (collections.patients) {
      //check if is a number
      user = (await collections.patients.findOne({
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
      })) as unknown as Patient;
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

patientsRouter.post("/create", async (req: Request, res: Response) => {
  const data: Patient<null> = req.body;
  // verification of id
  const worker = await createWorker("eng");
  const ret = await worker.recognize(data.identification.image);
  await worker.terminate();
  console.log(ret.data.text);
  if (!ret.data.text.includes(data.identification.number.toString()))
    return res.status(200).send({ status: STATUS_CODES.INVALID_IDENTITY });
  const keyAltName = data.identification.number.toString(2);
  try {
    await createKey(keyAltName);
    if (collections.patients) {
      const ins = await collections.patients.insertOne({
        // UserBase fields
        number: await encryption.encrypt(data.number, {
          keyAltName,
          algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
        }),
        dateJoined: await encryption.encrypt(data.dateJoined, {
          keyAltName,
          algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
        }),
        publicKey: await encryption.encrypt(data.publicKey, {
          keyAltName,
          algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
        }),
        privateKey: await encryption.encrypt(data.privateKey, {
          keyAltName: env.KEY_ALIAS,
          algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
        }),

        // Identification fields
        identification: {
          type: await encryption.encrypt(data.identification.type, {
            keyAltName,
            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
          }),
          number: await encryption.encrypt(data.identification.number, {
            keyAltName,
            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
          }),
          image: await encryption.encrypt(data.identification.image, {
            keyAltName,
            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
          }),
        },

        // Metrics (info) fields
        info: {
          age: await encryption.encrypt(data.info.age, {
            keyAltName,
            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
          }),
          height: await encryption.encrypt(data.info.height, {
            keyAltName,
            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
          }),
          weight: await encryption.encrypt(data.info.weight, {
            keyAltName,
            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
          }),
          dob: await encryption.encrypt(data.info.dob, {
            keyAltName,
            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
          }),
          sex: await encryption.encrypt(data.info.sex, {
            keyAltName,
            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
          }),
          blood: await encryption.encrypt(data.info.blood, {
            keyAltName,
            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
          }),
          pregnant: await encryption.encrypt(data.info.pregnant, {
            keyAltName,
            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
          }),
        },
        // Posts field
        posts: [],
      });
      res.send({ id: ins.insertedId, status: STATUS_CODES.SUCCESS });
    }
  } catch (error) {
    console.log(error);
    res.send({ status: STATUS_CODES.GENERIC_ERROR });
  }
});

patientsRouter.post("/check", async (req: Request, res: Response) => {
  const id: number = req.body.id;
  const number: string = req.body.number;
  try {
    let idUsers: Patient[] = [];
    let numberUsers: Patient[] = [];
    if (collections.patients) {
      idUsers = (await collections.patients
        .find({
          identification: {
            number: await encryption.encrypt(id, {
              algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
              keyAltName: id.toString(2),
            }),
          },
        })
        .toArray()) as unknown as Patient[];
      numberUsers = (await collections.patients
        .find({
          number: await encryption.encrypt(number, {
            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
            keyAltName: id.toString(2),
          }),
        })
        .toArray()) as unknown as Patient[];
    }
    if (idUsers.length !== 0)
      return res.status(200).send({ status: STATUS_CODES.ID_IN_USE });
    else if (numberUsers.length !== 0)
      res.status(200).send({ status: STATUS_CODES.NUMBER_IN_USE });
    else res.status(200).send({ status: STATUS_CODES.NONE_IN_USE });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: STATUS_CODES.GENERIC_ERROR });
  }
});
