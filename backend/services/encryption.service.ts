import { NextFunction, Request, Response, Send } from "express";
import * as dotenv from "ts-dotenv";
import NodeRSA from "encrypt-rsa";

const env = dotenv.load({
  SERVER_PUBLIC: String,
  SERVER_PRIVATE: String,
});

const nodeRSA = new NodeRSA(env.SERVER_PRIVATE, env.SERVER_PRIVATE, 2048);

export default function encryption(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.body.key || !req.body.data) {
    res.sendStatus(401);
    return;
  }
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
  next();
}
