import express, { Request, Response } from "express";
import {
  collections,
  createKey,
  encryption,
  env,
} from "../services/database.service";
import { STATUS_CODES, UserType } from "../models/util";
import { User } from "../models/user";
import Fact from "../models/fact";
import { ObjectId } from "mongodb";
import { encrypt } from "../services/encryption.service";

export const factsRouter = express.Router();

factsRouter.use(express.json());

// needs to 1st get facts from an ai
//2 store the facts and then post them at random to doctors
//3 the fact with the most likes gets sent to the users


// Utility function to get the start and end of the current day
const getStartAndEndOfDay = () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  return { startOfDay, endOfDay };
};

factsRouter.get("/", async (req: Request, res: Response) => {
  try {
    let fact: Fact | null = null;
    if (collections.facts) {
      const { startOfDay, endOfDay } = getStartAndEndOfDay();
      const randomFact = await collections.facts.aggregate([
        {
          $match: {
            timestamp: {
              $gte: startOfDay.getTime(),
              $lte: endOfDay.getTime(),
            },
          },
        },
        { $sample: { size: 1 } }, // Get a random fact
      ]).toArray() as Fact[];

      fact = randomFact.length > 0 ? randomFact[0] : null;
    }
    if (fact) res.status(200).send(encrypt({ fact, status: STATUS_CODES.SUCCESS }, req.headers.authorization));
    else res.status(200).send(encrypt({status: STATUS_CODES.GENERIC_ERROR }, req.headers.authorization));
  } catch (error) {
    console.error("Error fetching fact:", error);
    res.status(200).send(encrypt({ status: STATUS_CODES.GENERIC_ERROR }, req.headers.authorization));
  }
});

factsRouter.post("/like", async (req: Request, res: Response) => {
  const id: string = req.body.id
  const doctorID: string = req.body.doctorID
  try {
    if (collections.facts) {
      const update = await collections.facts.updateOne({
        _id: new ObjectId(id)
      }, {$push: {likes: doctorID}})
      if (update.acknowledged) return  res.status(200).send({ status: STATUS_CODES.SUCCESS });
      else return  res.status(200).send({ status: STATUS_CODES.GENERIC_ERROR });
    }
  }catch (error) {
    console.error("Error liking fact:", error);
    res.status(200).send({ status: STATUS_CODES.GENERIC_ERROR });
  }
} )

