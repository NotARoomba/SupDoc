import CryptoJS from "crypto-js";
import express, { Request, Response } from "express";
import { MongoCryptError, ObjectId, PushOperator } from "mongodb";
import { Doctor } from "../models/doctor";
import Patient from "../models/patient";
import Post from "../models/post";
import Report from "../models/report";
import { User } from "../models/user";
import { STATUS_CODES, UserType } from "../models/util";
import { collections, encryption } from "../services/database.service";
import { encrypt } from "../services/encryption.service";
import { generateSignedUrl } from "../services/storage.service";

export const usersRouter = express.Router();

usersRouter.use(express.json());

usersRouter.get("/:id", async (req: Request, res: Response) => {
  const id = new ObjectId(req.params.id);
  try {
    let user: User | null = null;
    if (collections.doctors && collections.patients) {
      const doctor = (await collections.doctors.findOne({
        _id: id,
      })) as Doctor;
      const patient = (await collections.patients.findOne({
        _id: id,
      })) as Patient;
      user = doctor ? doctor : patient;

      if (user) {
        user.publicKey = "";
        user.identification.number = 0;
        user.number = "";
        if (doctor) {
          user = user as Doctor;
          user.identification.license = [];
          user.comments = [];
          user.saved = [];
          user.publicKey = "";
          user.privateKey = "";
          user.reports = [];
          res.status(200).send(
            encrypt(
              {
                user: {
                  ...user,
                  picture: await generateSignedUrl(user.picture),
                },
                status: STATUS_CODES.SUCCESS,
              },
              req.headers.authorization,
            ),
          );
        } else {
          user = user as Patient;
          const posts = (await collections.posts
            .find({
              _id: {
                $in: user.posts.map((v) => new ObjectId(v)),
              },
            })
            .sort({ _id: -1 })
            .toArray()) as unknown as Post[];
          res.status(200).send(
            encrypt(
              {
                user: {
                  ...user,
                  posts: await Promise.all(
                    posts.map(async (v) => ({
                      ...v,
                      images: await Promise.all(
                        v.images.map(async (v) => await generateSignedUrl(v)),
                      ),
                    })),
                  ),
                },
                status: STATUS_CODES.SUCCESS,
              },
              req.headers.authorization,
            ),
          );
        }
      }
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

usersRouter.post("/check", async (req: Request, res: Response) => {
  const id: number = parseInt(req.body.id);
  const idHash = CryptoJS.SHA256(id.toString(2)).toString();
  const number: string | null = req.body.number;
  if (number == "+571234567890") {
    return res.send({ status: STATUS_CODES.SUCCESS });
  }
  try {
    let user: User | null = null;
    if (collections.patients && collections.doctors) {
      user = await collections.doctors.findOne({
        $or: [
          {
            "identification.number": id,
          },
          {
            number: number ?? "",
          },
        ],
      });
      if (user) {
        if (user.identification.number == id)
          return res.status(200).send({ status: STATUS_CODES.ID_IN_USE });
        else if (user.number == number)
          return res.status(200).send({ status: STATUS_CODES.NUMBER_IN_USE });
      }
      user = (await encryption.getKeyByAltName(idHash))
        ? ((await collections.patients.findOne({
            $or: [
              {
                "identification.number": await encryption.encrypt(id.toString(), {
                  algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
                  keyAltName: idHash,
                }),
              },
              {
                number: await encryption.encrypt(number ?? "", {
                  algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
                  keyAltName: idHash,
                }),
              },
            ],
          })) as User)
        : null;
      if (!user) return res.status(200).send({ status: STATUS_CODES.SUCCESS });
      else if (user.identification.number.toString() == id.toString())
        return res.status(200).send({ status: STATUS_CODES.ID_IN_USE });
      else if (user.number == number)
        return res.status(200).send({ status: STATUS_CODES.NUMBER_IN_USE });
    }
  } catch (error) {
    if (error instanceof MongoCryptError) {
      return res.status(200).send({ status: STATUS_CODES.SUCCESS });
    }
    res.status(200).send({ status: STATUS_CODES.GENERIC_ERROR });
  }
});

usersRouter.post("/keys", async (req: Request, res: Response) => {
  const id: number = parseInt(req.body.id);
  const idHash = CryptoJS.SHA256(id.toString(2)).toString();
  const userType: UserType = req.body.userType;
  // const number: string = req.body.number;
  // try {
  //   await createKey([
  //     id.toString(2),
  //     number
  //       .split("")
  //       .map((bin) => String.fromCharCode(parseInt(bin, 2)))
  //       .join(""),
  //   ]);
  // } catch {}
  try {
    let user: User | null;
    if (collections.patients && collections.doctors) {
      user =
        userType == UserType.DOCTOR
          ? await collections.doctors.findOne({
              "identification.number": id,
            })
          :  ((await collections.patients.findOne({
                "identification.number": await encryption.encrypt(id.toString(), {
                  algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
                  keyAltName: idHash,
                }),
              })) as User)
      if (!user)
        return res.status(200).send({ status: STATUS_CODES.USER_NOT_FOUND });
      res.status(200).send({
        status: STATUS_CODES.SUCCESS,
        private: user.privateKey,
        public: user.publicKey,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(200).send({ status: STATUS_CODES.GENERIC_ERROR });
  }
});

usersRouter.post("/delete", async (req: Request, res: Response) => {
  const userType: UserType = req.body.userType;
  try {
    if (collections.patients && collections.doctors) {
      const deleteResult =
        userType == UserType.DOCTOR
          ? await collections.doctors.deleteOne({
              publicKey: req.headers.authorization,
            })
          : await collections.patients.deleteOne({
              publicKey: req.headers.authorization,
            });
      if (!deleteResult.acknowledged)
        return res
          .status(200)
          .send(
            encrypt(
              { status: STATUS_CODES.ERROR_DELETING_USER },
              req.headers.authorization,
            ),
          );
      res.status(200).send(
        encrypt(
          {
            status: STATUS_CODES.SUCCESS,
          },
          req.headers.authorization,
        ),
      );
    }
  } catch (error) {
    console.log(error);
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

usersRouter.post("/report", async (req: Request, res: Response) => {
  const report: Report = req.body;

  // Fetch doctor or patient based on authorization token
  const doctor = (await collections.doctors.findOne({
    publicKey: req.headers.authorization,
  })) as Doctor;

  const patient = (await collections.patients.findOne({
    publicKey: req.headers.authorization,
  })) as Patient;

  const user = doctor ? doctor : patient;

  try {
    const existingReport = await collections.reports.findOne({
      reported: report.reported,
      reporter: {
        id: user._id,
        type: doctor ? UserType.DOCTOR : UserType.PATIENT,
      },
    });

    if (existingReport) {
      return res
        .status(200)
        .send(
          encrypt(
            { status: STATUS_CODES.ALREADY_REPORTED },
            req.headers.authorization,
          ),
        );
    }

    // Create the report
    const createdReport = await collections.reports.insertOne({
      reported: report.reported,
      reporter: {
        id: user._id as ObjectId,
        type: doctor ? UserType.DOCTOR : UserType.PATIENT,
      },
      reason: req.body.reason,
      evidence: req.body.evidence,
      timestamp: Date.now(),
    });

    // Find the post and comment
    if (!createdReport.acknowledged)
      return res
        .status(200)
        .send(
          encrypt(
            { status: STATUS_CODES.GENERIC_ERROR },
            req.headers.authorization,
          ),
        );

    //update both users

    const updateReporter = await (
      report.reporter.type == UserType.DOCTOR
        ? collections.doctors
        : collections.patients
    ).updateOne({ _id: new ObjectId(report.reporter.id) }, {
      $push: { reports: createdReport.insertedId },
    } as PushOperator<Document>);
    const updateReported = await (
      report.reported.type == UserType.DOCTOR
        ? collections.doctors
        : collections.patients
    ).updateOne({ _id: new ObjectId(report.reported.id) }, {
      $push: { reports: createdReport.insertedId },
    } as PushOperator<Document>);

    if (updateReported.acknowledged && updateReporter.acknowledged) {
      return res
        .status(200)
        .send(
          encrypt({ status: STATUS_CODES.SUCCESS }, req.headers.authorization),
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
  } catch (error) {
    console.error(error);
    return res
      .status(200)
      .send(
        encrypt(
          { status: STATUS_CODES.GENERIC_ERROR },
          req.headers.authorization,
        ),
      );
  }
});
