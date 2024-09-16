import express, { Request, Response } from "express";
import { collections } from "../services/database.service";
import { STATUS_CODES } from "../models/util";
import { Doctor } from "../models/doctor";
import { encrypt } from "../services/encryption.service";

export const doctorsRouter = express.Router();

doctorsRouter.use(express.json());

doctorsRouter.get("/", async (req: Request, res: Response) => {
  try {
    let user: Doctor | null = null;
    if (collections.doctors) {
      user = (await collections.doctors.findOne({
        privateKey: req.headers.authorization,
      })) as unknown as Doctor;
    }
    if (user) {
      res
        .status(200)
        .send(
          encrypt(
            { user, status: STATUS_CODES.SUCCESS },
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

doctorsRouter.post("/create", async (req: Request, res: Response) => {
  const data: Doctor = req.body;
  // verification of id
  // const worker = await createWorker("eng");
  // const ret = await worker.recognize(data.identification.image);
  // await worker.terminate();
  // console.log(ret.data.text);
  // if (!ret.data.text.includes(data.identification.number.toString()))
  //   return res.status(200).send({ status: STATUS_CODES.INVALID_IDENTITY });
  try {
    if (collections.doctors) {
      const ins = await collections.doctors.insertOne({
        ...data,
        identification: { ...data.identification, isVerified: false },
        comments: [],
        reports: [],
      });
      res.send({ status: STATUS_CODES.SUCCESS });
    }
  } catch (error) {
    console.log(error);
    res.send({ status: STATUS_CODES.GENERIC_ERROR });
  }
});
