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
        publicKey: req.headers.authorization,
      })) as unknown as Doctor;
    }
    if (user) {
      user.identification.license = [];
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
      await collections.doctors.insertOne({
        ...data,
        identification: { ...data.identification, isVerified: false },
        comments: [],
        reports: [],
        saved: [],
      });
      res.send({ status: STATUS_CODES.SUCCESS });
    }
  } catch (error) {
    console.log(error);
    res.send({ status: STATUS_CODES.GENERIC_ERROR });
  }
});

doctorsRouter.post("/update", async (req: Request, res: Response) => {
  //TODO: COOLDOWN ON UPDATING STUFF
  const data: Doctor = req.body;
  try {
    if (collections.doctors) {
      const upd = await collections.doctors.findOneAndUpdate(
        { publicKey: req.headers.authorization },
        {
          $set: {
            number: data.number,
            picture: data.picture,
            info: {
              ...data.info
            }
          },
        },
        { returnDocument: "after" },
      );
      if (upd) {
        upd.identification.license = [];
        res
          .status(200)
          .send(
            encrypt(
              { user: upd, status: STATUS_CODES.SUCCESS },
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
    }
  } catch (error) {
    console.log(error);
    res.send({ status: STATUS_CODES.GENERIC_ERROR });
  }
});
