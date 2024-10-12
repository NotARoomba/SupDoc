import CryptoJS from "crypto-js";
import { NextFunction, Request, Response } from "express";
import NodeRSA from "node-rsa";
import STATUS_CODES from "../models/status";
import { collections, env } from "./database.service";
const nodeRSA = new NodeRSA(env.SERVER_PRIVATE, "pkcs1", {
  encryptionScheme: "pkcs1",
  environment: "browser",
});

export async function decryptionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  //check authorization and see if limited auth
  if (!req.headers.authorization)
    return res.send({ status: STATUS_CODES.UNAUTHORIZED });
  const obj = JSON.parse(
    CryptoJS.enc.Base64.parse(req.headers.authorization).toString(
      CryptoJS.enc.Utf8,
    ),
  );
  const authKey = nodeRSA.decrypt(obj.key, "utf8");
  const auth = CryptoJS.AES.decrypt(obj.data, authKey).toString(
    CryptoJS.enc.Utf8,
  );
  req.headers.authorization = auth;
  if (
    auth == env.LIMITED_AUTH &&
    ![
      "/patients/create",
      "/doctors/create",
      "/users/check",
      "/users/keys",
      "/images/upload",
      "/verify/code/send",
      "/verify/code/check",
      "/verify/doctor",
    ].includes(req.originalUrl)
  )
    return res.send({ status: STATUS_CODES.UNAUTHORIZED });
  // checks if the authorization exists
  else if (auth != env.LIMITED_AUTH) {
    const doctorExists = await collections.doctors?.findOne({
      publicKey: auth,
    });
    const patientExists = await collections.patients?.findOne({
      publicKey: auth,
    });
    // console.log(patientExists, doctorExists)
    // await encryption.decrypt(doctorExists?.publicKey)
    if (!(doctorExists || patientExists))
      return res.send({ status: STATUS_CODES.UNAUTHORIZED });
    else {
      res.locals.doctor = doctorExists;
      res.locals.patient = patientExists;
    }
    //need to add protected routes
    // else if ((doctorExists && ![""].includes(req.originalUrl)) || (patientExists && ![""].includes(req.originalUrl)))
    //   return res.send({ status: STATUS_CODES.UNAUTHORIZED });
  }
  if (req.originalUrl == "/images/upload") {
    // console.log(req.body);
    req.files = req.body.files;
    return next();
  }
  if (req.method == "POST") {
    if (!req.body.key || !req.body.data)
      return res.send({ status: STATUS_CODES.UNAUTHORIZED });
    const key = nodeRSA.decrypt(req.body.key, "utf8");
    const data = CryptoJS.AES.decrypt(req.body.data, key);
    req.body = JSON.parse(data.toString(CryptoJS.enc.Utf8));
  }
  next();
}

export function encrypt(body: any, auth: string | undefined) {
  const key = CryptoJS.SHA256(body).toString();
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(body), key).toString();
  return {
    key:
      auth == env.LIMITED_AUTH
        ? key
        : new NodeRSA(
            auth as string,
            !auth?.includes("RSA") ? "pkcs8-public" : "pkcs1-public",
            {
              encryptionScheme: "pkcs1",
              environment: "browser",
            },
          )
            .encrypt(key)
            .toString("base64"),
    body: encrypted,
  };
}
