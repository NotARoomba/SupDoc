import express, { Request, Response } from "express";
import { collections } from "../services/database.service";
import STATUS_CODES from "../models/status";
import { MongoClient, ObjectId } from "mongodb";
import Patient from "../models/patient";

export const patientsRouter = express.Router();

patientsRouter.use(express.json());

// Users should be able to be fetched through their number, always have 2 step verification on

patientsRouter.get("/:numberid", async (req: Request, res: Response) => {
  const numberid = req?.params?.numberid;
  console.log(`Getting data for: ${numberid}`);
  try {
    let user: Patient | null = null;
    if (collections.patients) {
      //check if is a number
      if (numberid.includes("+")) {
        user = (await collections.patients.findOne({
          number: numberid,
        })) as unknown as Patient;
      } else {
        user = (await collections.patients.findOne({
          _id: new ObjectId(numberid),
        })) as unknown as Patient;
      }
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

patientsRouter.post("/update", async (req: Request, res: Response) => {
  const data: Patient = req.body;
  let id: ObjectId | null = null;
  try {
    if (collections.patients) {
      if (data._id) {
        id = new ObjectId(data._id);
        const { _id, ...updateData } = data;
        await collections.patients.updateOne({ _id: id }, { $set: updateData });
      } else {
        const res = await collections.patients.updateOne(
          { number: data.number },
          { $set: data },
          {
            upsert: true,
          },
        );
        id = res.upsertedId;
      }
    }
    res.send({ id, status: STATUS_CODES.SUCCESS });
  } catch (error) {
    console.log(error);
    res.send({ status: STATUS_CODES.GENERIC_ERROR });
  }
});

patientsRouter.post("/check", async (req: Request, res: Response) => {
  const id: string = req.body.username;
  const number: string = req.body.email;
  try {
    let idUsers: Patient[] = [];
    let numberUsers: Patient[] = [];
    if (collections.patients) {
      idUsers = (await collections.patients
        .find({ identification: { number: id } })
        .toArray()) as unknown as Patient[];
      numberUsers = (await collections.patients
        .find({ number })
        .toArray()) as unknown as Patient[];
    }
    if (idUsers.length !== 0)
      return res.status(200).send({ status: STATUS_CODES.ID_IN_USE });
    else if (numberUsers.length !== 0)
      res.status(200).send({ status: STATUS_CODES.NUMBER_IN_USE });
    else res.status(200).send({ status: STATUS_CODES.NONE_IN_USE });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: STATUS_CODES.GENERIC_ERROR });
  }
});
