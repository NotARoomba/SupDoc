import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { Doctor } from "../models/doctor";
import Fact from "../models/fact";
import Patient from "../models/patient";
import { STATUS_CODES } from "../models/util";
import { collections } from "../services/database.service";
import { encrypt } from "../services/encryption.service";

export const factsRouter = express.Router();

factsRouter.use(express.json());

// needs to 1st get facts from an ai
//2 store the facts and then post them at random to doctors
//3 the fact with the most likes gets sent to the users

// Utility function to get the start and end of the current day
export const getStartAndEndOfDay = () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  return { startOfDay, endOfDay };
};
//for doctors
factsRouter.get("/", async (req: Request, res: Response) => {
  try {
    // Fetch doctor or patient based on authorization token
    const doctor = (await collections.doctors.findOne({
      publicKey: req.headers.authorization,
    })) as Doctor;

    const patient = (await collections.patients.findOne({
      publicKey: req.headers.authorization,
    })) as Patient;

    const user = doctor ? doctor : patient;

    if (!user) {
      return res
        .status(200)
        .send(
          encrypt(
            { status: STATUS_CODES.UNAUTHORIZED },
            req.headers.authorization,
          ),
        );
    }

    if (collections.facts) {
      let facts: Fact[] | null = null;

      // If the user is a doctor, fetch all random facts within the day
      if (doctor) {
        const { startOfDay, endOfDay } = getStartAndEndOfDay();
        const randomFacts = (await collections.facts
          .find({
            timestamp: {
              $gte: startOfDay.getTime(),
              $lte: endOfDay.getTime(),
            },
          })
          .toArray()) as Fact[];

        facts = randomFacts.length > 0 ? randomFacts : null;
      }

      // If the user is a patient, get a random fact from the top 3 most liked facts
      if (patient) {
        const topLikedFacts = (await collections.facts
          .aggregate([
            {
              $addFields: {
                likesCount: { $size: "$likes" }, // Add a field that counts the number of likes
              },
            },
            { $sort: { likesCount: -1 } }, // Sort by number of likes in descending order
            { $limit: 3 }, // Limit to top 3 most liked facts
            { $sample: { size: 1 } }, // Pick a random fact from these top 3
          ])
          .toArray()) as Fact[];

        facts = topLikedFacts.length > 0 ? [topLikedFacts[0]] : null;
      }

      // Send response based on retrieved facts
      if (facts) {
        return res
          .status(200)
          .send(
            encrypt(
              { facts, status: STATUS_CODES.SUCCESS },
              req.headers.authorization,
            ),
          );
      } else {
        return res
          .status(200)
          .send(
            encrypt(
              { status: STATUS_CODES.NO_FACTS_FOUND },
              req.headers.authorization,
            ),
          );
      }
    }
  } catch (error) {
    console.error("Error fetching facts:", error);
    res
      .status(200)
      .send(
        encrypt(
          { status: STATUS_CODES.GENERIC_ERROR },
          req.headers.authorization,
        ),
      );
  }
});

factsRouter.get("/:id/like", async (req: Request, res: Response) => {
  const id = new ObjectId(req.params.id);
  const doctor = await collections.doctors.findOne({
    publicKey: req.headers.authorization,
  });

  try {
    if (collections.facts) {
      const update = await collections.facts.updateOne(
        {
          _id: id,
        },
        [
          {
            $set: {
              likes: {
                $cond: {
                  if: { $in: [doctor?._id, "$likes"] }, // Check if 'doctor' is in 'dislikes' array
                  then: { $setDifference: ["$likes", [doctor?._id]] }, // Remove 'doctor' from 'dislikes' if it exists
                  else: { $concatArrays: ["$likes", [doctor?._id]] }, // Add 'doctor' to 'dislikes' if it doesn't exist
                },
              },
              dislikes: {
                $setDifference: ["$dislikes", [doctor?._id]], // Always remove 'doctor' from 'likes' if they dislike the fact
              },
            },
          },
        ],
      );

      if (update.acknowledged) {
        return res
          .status(200)
          .send(
            encrypt(
              { status: STATUS_CODES.SUCCESS },
              req.headers.authorization,
            ),
          );
      } else {
        return res
          .status(200)
          .send(
            encrypt(
              { status: STATUS_CODES.GENERIC_ERROR },
              req.headers.authorization,
            ),
          );
      }
    }
  } catch (error) {
    console.error("Error liking fact:", error);
    res
      .status(200)
      .send(
        encrypt(
          { status: STATUS_CODES.GENERIC_ERROR },
          req.headers.authorization,
        ),
      );
  }
});

factsRouter.get("/:id/dislike", async (req: Request, res: Response) => {
  const id = new ObjectId(req.params.id);
  const doctor = await collections.doctors.findOne({
    publicKey: req.headers.authorization,
  });

  try {
    if (collections.facts) {
      const update = await collections.facts.updateOne(
        {
          _id: id,
        },
        [
          {
            $set: {
              dislikes: {
                $cond: {
                  if: { $in: [doctor?._id, "$dislikes"] }, // Check if 'doctor' is in 'dislikes' array
                  then: { $setDifference: ["$dislikes", [doctor?._id]] }, // Remove 'doctor' from 'dislikes' if it exists
                  else: { $concatArrays: ["$dislikes", [doctor?._id]] }, // Add 'doctor' to 'dislikes' if it doesn't exist
                },
              },
              likes: {
                $setDifference: ["$likes", [doctor?._id]], // Always remove 'doctor' from 'likes' if they dislike the fact
              },
            },
          },
        ],
      );

      if (update.acknowledged) {
        return res
          .status(200)
          .send(
            encrypt(
              { status: STATUS_CODES.SUCCESS },
              req.headers.authorization,
            ),
          );
      } else {
        return res
          .status(200)
          .send(
            encrypt(
              { status: STATUS_CODES.GENERIC_ERROR },
              req.headers.authorization,
            ),
          );
      }
    }
  } catch (error) {
    console.error("Error disliking fact:", error);
    res
      .status(200)
      .send(
        encrypt(
          { status: STATUS_CODES.GENERIC_ERROR },
          req.headers.authorization,
        ),
      );
  }
});
