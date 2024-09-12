import express, { Request, Response } from "express";
import {
  collections,
  createKey,
  encryption,
  env,
} from "../services/database.service";
import { STATUS_CODES } from "../models/util";
import { MongoCryptError, ObjectId } from "mongodb";
import Patient from "../models/patient";
import { createWorker } from "tesseract.js";

export const patientsRouter = express.Router();

patientsRouter.use(express.json());

patientsRouter.get("/", async (req: Request, res: Response) => {
  try {
    let user: Patient | null = null;
    if (collections.patients) {
      //check if is a number
      user = (await collections.patients.findOne({
        privateKey: await encryption.encrypt(req.headers.authorization, {
          keyId: (await encryption.getKeyByAltName(env.KEY_ALIAS))?._id,
          algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
        }),
      })) as unknown as Patient;
    }
    console.log("GET USER", user)
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
  // const worker = await createWorker("eng");
  // const ret = await worker.recognize(data.identification.image);
  // await worker.terminate();
  // console.log(ret.data.text);
  // if (!ret.data.text.includes(data.identification.number.toString()))
  //   return res.status(200).send({ status: STATUS_CODES.INVALID_IDENTITY });
  const keyAltName = data.identification.number.toString(2);
  try {
    const keyUDID = await createKey([keyAltName, data.number.split('').map(bin => String.fromCharCode(parseInt(bin, 2))).join('')]);
    const sexData =
      data.info.altSex && data.info.altSex !== data.info.sex
        ? {
            altSex: await encryption.encrypt(data.info.altSex, {
              keyAltName,
              algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
            }),
            hormones: await encryption.encrypt(data.info.hormones, {
              keyAltName,
              algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
            }),
            surgery: await encryption.encrypt(data.info.surgery, {
              keyAltName,
              algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
            }),
            sex: await encryption.encrypt(data.info.sex, {
              keyAltName,
              algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
            }),
          }
        : {
            sex: await encryption.encrypt(data.info.sex, {
              keyAltName,
              algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
            }),
          };
    if (collections.patients) {
      const ins = await collections.patients.insertOne({
        // UserBase fields
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
          keyId: (await encryption.getKeyByAltName(env.KEY_ALIAS))?._id,
          algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
        }),

        // Identification fields
        identification: {
          // type: await encryption.encrypt(data.identification.type, {
          //   keyAltName,
          //   algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
          // }),
          number: await encryption.encrypt(data.identification.number, {
            keyId: keyUDID,
            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
          }),
          // image: await encryption.encrypt(data.identification.image, {
          //   keyAltName,
          //   algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
          // }),
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
          blood: await encryption.encrypt(data.info.blood, {
            keyAltName,
            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
          }),
          pregnant: await encryption.encrypt(data.info.pregnant, {
            keyAltName,
            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
          }),
          ...sexData,
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