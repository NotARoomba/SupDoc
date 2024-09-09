import { NextFunction, Request, Response, Send } from "express";
import NodeRSA from "node-rsa";
import { collections, encryption, env } from "./database.service";
import CryptoJS from "crypto-js";
const nodeRSA = new NodeRSA(env.SERVER_PRIVATE, 'pkcs1', {encryptionScheme: 'pkcs1', environment: 'browser'});

export default async function encryptionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  //check authorization and see if limited auth
  if (!req.headers.authorization) return res.sendStatus(401);
  const auth = nodeRSA.decrypt(req.headers.authorization).toString();
  if (
    auth == env.LIMITED_AUTH &&
    ![
      "/patients/create",
      "/patients/check",
      "/doctors/create",
      "/doctors/check",
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
    const key = nodeRSA.decrypt(req.body.key, 'utf8');
    const data = CryptoJS.AES.decrypt(req.body.data, key);
    req.body = JSON.parse(data.toString(CryptoJS.enc.Utf8));
    res.send = function (body: any) {
      const key = CryptoJS.SHA256(body).toString();
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(body), key).toString();
      // need to check fot the public key of the user
      return this.send({
        key: false ? nodeRSA.encrypt(key, 'utf8') : key,
        body: encrypted,
      });
    };
  }
  next();
}
