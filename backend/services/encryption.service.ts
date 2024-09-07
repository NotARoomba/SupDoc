import { NextFunction, Request, Response, Send } from "express";
import * as dotenv from "ts-dotenv";
import NodeRSA from "node-rsa";
import Crypto from 'crypto'
import { collections, encryption, env } from "./database.service";

// const nodeRSA = new NodeRSA(env.SERVER_PRIVATE.replace(/\\n/g,"\n"), 'pkcs8');

const privKey = Crypto.createPrivateKey(env.SERVER_PRIVATE.replace(/\\n/g,"\n"))
privKey.asymmetricKeySize = 2048
privKey.asymmetricKeyType = 'rsa'


export default async function encryptionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  //check authorization and see if limited auth
  console.log(req.body);
  console.log(req.headers.authorization)
  if (!req.headers.authorization) return res.sendStatus(401);
  const auth = Crypto.privateDecrypt(privKey, Buffer.from(req.headers.authorization)).toString();
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
    const key = Crypto.privateDecrypt(privKey, Buffer.from(req.body.key)).toString();
    const data = CryptoJS.AES.decrypt(req.body.data, key);
    req.body = data;
    res.send = function (body: any) {
      const key = CryptoJS.lib.WordArray.random(256 / 8).toString();
      const encrypted = CryptoJS.AES.encrypt(body, key).toString();
      // NEEDS TO BE FIXED
      return this.send({
        key: key,
        body: encrypted,
      });
    };
  }
  next();
}
