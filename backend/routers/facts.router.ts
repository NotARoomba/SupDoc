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

export const factsRouter = express.Router();

factsRouter.use(express.json());

factsRouter.get("/", async (req: Request, res: Response) => {
  try {
    let fact: Fact | null = null;
    if (collections.facts) {
     
    }
    res.status(200).send({fact, status: STATUS_CODES.SUCCESS})
  } catch (error) {
    res.status(500).send({ status: STATUS_CODES.GENERIC_ERROR });
  }
});
