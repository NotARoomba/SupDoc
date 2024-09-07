import { NextFunction, Request, Response, Send } from "express";
import * as dotenv from "ts-dotenv";
import NodeRSA from "encrypt-rsa";
import { collections, encryption, env } from "./database.service";

const nodeRSA = new NodeRSA(env.SERVER_PUBLIC, env.SERVER_PRIVATE, 2048);

export default async function encryptionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  //check authorization and see if limited auth
  console.log(req);

  if (!req.headers.authorization) return res.sendStatus(401);
  console.log("Passed AUTH")
  const auth = nodeRSA.decrypt({ text: req.headers.authorization });
  console.log(auth)
  if (
    auth == env.LIMITED_AUTH &&
    ![
      "/users/create",
      "/users/check",
      "/verify/code/send",
      "/verify/code/check",
    ].includes(req.originalUrl)
  )
    return res.status(401);
  // checks if the authorization exists
  else if (auth != env.LIMITED_AUTH) {
    const doctorExists = await collections.doctors?.findOne({
      privateKey: await encryption.encrypt(auth, {
        keyAltName: env.KEY_ALIAS,
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
      }),
    });
    const patientExists = await collections.patients?.findOne({
      privateKey: await encryption.encrypt(auth, {
        keyAltName: env.KEY_ALIAS,
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
      }),
    });
    if (!(doctorExists || patientExists)) return res.sendStatus(401);
  }

  if (req.method == "POST") {
    if (!req.body.key || !req.body.data) return res.sendStatus(401);
    const key = nodeRSA.decrypt({ text: req.body.key });
    const data = CryptoJS.AES.decrypt(req.body.data, key);
    req.body = data;
    res.send = function (body: any) {
      const key = CryptoJS.lib.WordArray.random(256 / 8).toString();
      const encrypted = CryptoJS.AES.encrypt(body, key).toString();
      return this.send({
        key: nodeRSA.encryptStringWithRsaPublicKey({
          publicKey: body.publicKey,
          text: key,
        }),
        body: encrypted,
      });
    };
  }
  next();
}
