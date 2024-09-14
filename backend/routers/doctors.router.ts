import express, { Request, Response } from "express";
import {
  collections,
  createKey,
  encryption,
  env,
} from "../services/database.service";
import { STATUS_CODES } from "../models/util";
import { MongoCryptError, ObjectId } from "mongodb";
import { Doctor } from "../models/doctor";
import { createWorker } from "tesseract.js";

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
      const ins = await collections.doctors.insertOne({...data,
        identification: {...data.identification, isVerified: false},
        comments: [],
        reports: [],
      });
      res.send({ id: ins.insertedId, status: STATUS_CODES.SUCCESS });
    }
  } catch (error) {
    console.log(error);
    res.send({ status: STATUS_CODES.GENERIC_ERROR });
  }
});