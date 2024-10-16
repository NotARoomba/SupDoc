import CryptoJS from "crypto-js";
import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { io } from "..";
import Patient from "../models/patient";
import Post from "../models/post";
import STATUS_CODES from "../models/status";
import {
  collections,
  createKey,
  encryption,
  env,
} from "../services/database.service";
import { encrypt } from "../services/encryption.service";
import { generateSignedUrl } from "../services/storage.service";

export const patientsRouter = express.Router();

patientsRouter.use(express.json());

patientsRouter.get("/", async (req: Request, res: Response) => {
  try {
    if (res.locals.patient) {
      res.status(200).send(
        encrypt(
          {
            user: {
              ...res.locals.patient,
              identification: {
                ...res.locals.patient.identification,
                number: parseInt(
                  res.locals.patient.identification.number as unknown as string,
                ),
              },
            },
            status: STATUS_CODES.SUCCESS,
          },
          req.headers.authorization,
        ),
      );
    } else {
      res.status(404).send(
        encrypt(
          {
            user: null,
            status: STATUS_CODES.USER_NOT_FOUND,
          },
          req.headers.authorization,
        ),
      );
    }
  } catch (error) {
    console.log(error);
    res
      .status(404)
      .send(
        encrypt(
          { status: STATUS_CODES.GENERIC_ERROR },
          req.headers.authorization,
        ),
      );
  }
});

patientsRouter.post("/create", async (req: Request, res: Response) => {
  const data: Patient = req.body;
  // verification of id
  // const worker = await createWorker("eng");
  // const ret = await worker.recognize(data.identification.image);
  // await worker.terminate();
  // console.log(ret.data.text);
  // if (!ret.data.text.includes(data.identification.number.toString()))
  //   return res.status(200).send({ status: STATUS_CODES.INVALID_IDENTITY });
  const keyAltName = CryptoJS.SHA256(
    data.identification.number.toString(2),
  ).toString();
  try {
    const keyUDID = await createKey([
      keyAltName,
      CryptoJS.SHA256(
        data.number
          .split("")
          .map((bin) => bin.charCodeAt(0).toString(2))
          .join(""),
      ).toString(),
    ]);
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
        publicKey: data.publicKey,
        privateKey: await encryption.encrypt(data.privateKey, {
          keyAltName: env.KEY_ALIAS,
          algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
        }),

        // Identification fields
        identification: {
          // type: await encryption.encrypt(data.identification.type, {
          //   keyAltName,
          //   algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
          // }),
          number: await encryption.encrypt(
            data.identification.number.toString(),
            {
              keyId: keyUDID,
              algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
            },
          ),
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
          altSex: await encryption.encrypt(data.info.altSex ?? data.info.sex, {
            keyAltName,
            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
          }),
          hormones: await encryption.encrypt(data.info.hormones ?? false, {
            keyAltName,
            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
          }),
          surgery: await encryption.encrypt(data.info.surgery ?? false, {
            keyAltName,
            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
          }),
          sex: await encryption.encrypt(data.info.sex, {
            keyAltName,
            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
          }),
        },
        // Posts field
        posts: [],
        pushTokens: [],
      });
      await createKey([CryptoJS.SHA256(ins.insertedId.toString()).toString()]);
      res.send(
        encrypt({ status: STATUS_CODES.SUCCESS }, req.headers.authorization),
      );
    }
  } catch (error) {
    console.log(error);
    res.send(
      encrypt(
        { status: STATUS_CODES.GENERIC_ERROR },
        req.headers.authorization,
      ),
    );
  }
});

patientsRouter.post("/update", async (req: Request, res: Response) => {
  const data: Patient = req.body;
  const keyAltName = CryptoJS.SHA256(
    data.identification.number.toString(2),
  ).toString();
  try {
    const keyUDID = await createKey([
      keyAltName,
      CryptoJS.SHA256(
        data.number
          .split("")
          .map((bin) => String.fromCharCode(parseInt(bin, 2)))
          .join(""),
      ).toString(),
    ]);
    if (collections.patients) {
      const upd = await collections.patients.findOneAndUpdate(
        { publicKey: req.headers.authorization },
        {
          $set: {
            number: await encryption.encrypt(data.number, {
              keyId: keyUDID,
              algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
            }),
            "info.height": await encryption.encrypt(data.info.height, {
              keyAltName,
              algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
            }),
            "info.weight": await encryption.encrypt(data.info.weight, {
              keyAltName,
              algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
            }),
            "info.pregnant": await encryption.encrypt(data.info.pregnant, {
              keyAltName,
              algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
            }),
            "info.altSex": await encryption.encrypt(data.info.altSex, {
              keyAltName,
              algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
            }),
            "info.hormones": await encryption.encrypt(data.info.hormones, {
              keyAltName,
              algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
            }),
            "info.surgery": await encryption.encrypt(data.info.surgery, {
              keyAltName,
              algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
            }),
          },
        },
        { returnDocument: "after" },
      );
      res.send(
        encrypt(
          { user: upd, status: STATUS_CODES.SUCCESS },
          req.headers.authorization,
        ),
      );
    }
  } catch (error) {
    console.log(error);
    res.send(
      encrypt(
        { status: STATUS_CODES.GENERIC_ERROR },
        req.headers.authorization,
      ),
    );
  }
});

// DECAPRICATED AND WILL BE REMOVED
patientsRouter.get("/posts", async (req: Request, res: Response) => {
  try {
    if (collections.posts) {
      const posts = (await collections.posts
        .find({
          _id: {
            $in: (res.locals.patient.posts as ObjectId[]).map(
              (v) => new ObjectId(v),
            ),
          },
        })
        .sort({ _id: -1 })
        .toArray()) as unknown as Post[];
      for (let post of posts)
        await io.sockets.sockets
          .get(res.locals.patient._id.toString())
          ?.join(post._id?.toString() as string);
      res.send(
        encrypt(
          {
            posts: await Promise.all(
              posts.map(async (v) => ({
                ...v,
                images: await Promise.all(
                  v.images.map(async (v) => await generateSignedUrl(v)),
                ),
              })),
            ),
            status: STATUS_CODES.SUCCESS,
          },
          req.headers.authorization,
        ),
      );
    }
  } catch (error) {
    console.log(error);
    res.send(
      encrypt(
        { status: STATUS_CODES.GENERIC_ERROR },
        req.headers.authorization,
      ),
    );
  }
});
