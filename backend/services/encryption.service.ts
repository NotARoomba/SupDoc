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
  const obj = JSON.parse(CryptoJS.enc.Base64.parse(req.headers.authorization).toString(CryptoJS.enc.Utf8))
  const authKey = nodeRSA.decrypt(obj.key, 'utf8');
  const auth = CryptoJS.AES.decrypt(obj.data, authKey).toString(CryptoJS.enc.Utf8);
  req.headers.authorization = auth;
  let publicKey: string = "none";
  if (
    auth == env.LIMITED_AUTH &&
    ![
      "/patients/create",
      "/patients/keys",
      "/doctors/create",
      "/doctors/keys",
      "/users/check",
      "/users/keys",
      "/verify/code/send",
      "/verify/code/check",
    ].includes(req.originalUrl)
  )
    return res.sendStatus(401);
  // checks if the authorization exists
  else if (auth != env.LIMITED_AUTH) {
    const doctorExists = await collections.doctors?.findOne({
      publicKey: auth});
    const patientExists = await collections.patients?.findOne({
      publicKey: auth});
      console.log(patientExists, doctorExists)
    // await encryption.decrypt(doctorExists?.publicKey)
    if (!(doctorExists || patientExists)) return res.sendStatus(401);
    else if (doctorExists)  publicKey = doctorExists.publicKey as unknown as string;
    else if (patientExists)  publicKey = patientExists.publicKey as unknown as string;
    console.log("PUBLIC KEY", publicKey)

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
              : (new NodeRSA(publicKey as string, "pkcs1", {
                  encryptionScheme: "pkcs1",
                  environment: "browser",
                }))
                  .encrypt(key)
                  .toString(),
          body: encrypted,
        });
      };
    }
  next();
}
