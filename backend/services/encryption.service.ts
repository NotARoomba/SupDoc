import { NextFunction, Request, Response, Send } from "express";
import NodeRSA from "node-rsa";
import { collections, encryption, env } from "./database.service";
import CryptoJS from "crypto-js";
const nodeRSA = new NodeRSA(env.SERVER_PRIVATE, "pkcs1", {
  encryptionScheme: "pkcs1",
  environment: "browser",
});

export default async function encryptionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  //check authorization and see if limited auth
  if (!req.headers.authorization) return res.sendStatus(401);
  const auth = nodeRSA.decrypt(req.headers.authorization).toString();
  console.log(req.originalUrl)
  let publicKey: string;
  if (
    auth == env.LIMITED_AUTH &&
    ![
      "/patients/create",
      "/patients/keys",
      "/doctors/create",
      "/doctors/keys",
      "/users/check",
      "/verify/code/send",
      "/verify/code/check",
    ].includes(req.originalUrl)
  )
    return res.sendStatus(401);
  // checks if the authorization exists
  else if (auth != env.LIMITED_AUTH) {
    const doctorExists = await collections.doctors?.findOne({
      privateKey: auth});
    const patientExists = await collections.patients?.findOne({
      privateKey: auth});
      console.log(patientExists, doctorExists)
    // await encryption.decrypt(doctorExists?.publicKey)
    if (!(doctorExists || patientExists)) return res.sendStatus(401);
    else if (doctorExists)  publicKey = doctorExists.publicKey as unknown as string;
    else if (patientExists)  publicKey = patientExists.publicKey as unknown as string;
    

    }
    if (req.method == "POST") {
      if (!req.body.key || !req.body.data) return res.sendStatus(401);
      const key = nodeRSA.decrypt(req.body.key, "utf8");
      const data = CryptoJS.AES.decrypt(req.body.data, key);
      req.body = JSON.parse(data.toString(CryptoJS.enc.Utf8));
      const oldSend = res.send;
      res.send = function (body: any) {
        const key = CryptoJS.SHA256(body).toString();
        const encrypted = CryptoJS.AES.encrypt(
          JSON.stringify(body),
          key,
        ).toString();
        // need to check fot the public key of the user
        res.send = oldSend;
        return res.send({
          key:
            auth == env.LIMITED_AUTH
              ? key
              : new NodeRSA(publicKey as string, "pkcs1-public", {
                  encryptionScheme: "pkcs1",
                  environment: "browser",
                })
                  .encrypt(key)
                  .toString(),
          body: encrypted,
        });
      };
    }
  next();
}
