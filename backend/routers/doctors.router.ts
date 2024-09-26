import axios from "axios";
import * as cheerio from "cheerio";
import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { Doctor } from "../models/doctor";
import Post from "../models/post";
import { STATUS_CODES } from "../models/util";
import { collections, env } from "../services/database.service";
import { encrypt } from "../services/encryption.service";
import {
  generateSignedUrl,
  removeImageFromStorage,
  upload,
} from "../services/storage.service";

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
            {
              user: { ...user, picture: await generateSignedUrl(user.picture) },
              status: STATUS_CODES.SUCCESS,
            },
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

doctorsRouter.post(
  "/create",
  upload.array("files"),
  async (req: Request, res: Response) => {
    const data: Doctor = req.body;
    // run check with doctor database again
    // verification of id
    // const worker = await createWorker("eng");
    // const ret = await worker.recognize(data.identification.image);
    // await worker.terminate();
    // console.log(ret.data.text);
    // if (!ret.data.text.includes(data.identification.number.toString()))
    //   return res.status(200).send({ status: STATUS_CODES.INVALID_IDENTITY });
    console.log(data.identification.number);
    const [firstName, lastName] = data.name.split(" ");
    const verifyRes = await axios.post(
      env.VERIFY_URL,
      env.VERIFY_BODY_1.replace("{{ID}}", data.identification.number.toString())
        .replace("{{FIRST_NAME}}", firstName)
        .replace("{{LAST_NAME}}", lastName),
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0) Gecko/20100101 Firefox/130.0",
          Accept: "*/*",
          "Accept-Language": "en-US,en;q=0.5",
          "X-Requested-With": "XMLHttpRequest",
          "X-MicrosoftAjax": "Delta=true",
          "Cache-Control": "no-cache",
          "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          Priority: "u=0",
        },
        withCredentials: true,
      },
    );
    const $ = cheerio.load(verifyRes.data);
    const noDoctorFoundMessage = $(
      "span#ctl00_cntContenido_LblResultado",
    ).text();
    if (noDoctorFoundMessage.includes(env.VERIFY_NONE))
      return res.send({ status: STATUS_CODES.DOCTOR_INVALID });
    try {
      if (collections.doctors) {
        // const licenseURLS = await Promise.all(
        //   data.identification.license.map(
        //     async (image: any) => await uploadImageToStorage(image),
        //   ),
        // );
        // const pictureURL = await uploadImageToStorage(data.picture);
        // if (!pictureURL || licenseURLS.every((url) => url === null))
        //   return res.send({ status: STATUS_CODES.ERROR_UPLOADING_IMAGE });
        await collections.doctors.insertOne({
          ...data,
          // picture: pictureURL,
          identification: {
            ...data.identification,
            // license: licenseURLS as string[],
            isVerified: false,
          },
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
  },
);

doctorsRouter.post("/update", async (req: Request, res: Response) => {
  const data: Doctor = req.body;
  try {
    if (collections.doctors) {
      // const pictureURL = await uploadImageToStorage(data.picture);
      // if (!pictureURL)
      //   return res.send(
      //     encrypt(
      //       { status: STATUS_CODES.ERROR_UPLOADING_IMAGE },
      //       req.headers.authorization,
      //     ),
      //   );
      const upd = await collections.doctors.findOneAndUpdate(
        { publicKey: req.headers.authorization },
        {
          $set: {
            number: data.number,
            picture: data.picture,
            // picture: pictureURL,
            info: {
              ...data.info,
            },
          },
        },
        { returnDocument: "before" },
      );
      if (upd) {
        await removeImageFromStorage(upd.picture);
        res.status(200).send(
          encrypt(
            {
              user: {
                ...data,
                // picture: await generateSignedUrl(pictureURL),
              },
              status: STATUS_CODES.SUCCESS,
            },
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
    res.send(
      encrypt(
        { status: STATUS_CODES.GENERIC_ERROR },
        req.headers.authorization,
      ),
    );
  }
});

doctorsRouter.get("/posts/:timestamp", async (req: Request, res: Response) => {
  const timestamp: number = parseInt(req.params.timestamp);
  try {
    if (collections.posts) {
      const posts = (await collections.posts
        .find({ timestamp: { $gt: timestamp } })
        .sort({ timestamp: -1 })
        .limit(8)
        .toArray()) as unknown as Post[];
      // this is hell
      res.send(
        encrypt(
          {
            posts: await Promise.all(
              posts.map(async (v) => ({
                ...v,
                images: await Promise.all(
                  v.images.map(async (v) => await generateSignedUrl(v)),
                ),
              })),
            ),
            status: STATUS_CODES.SUCCESS,
          },
          req.headers.authorization,
        ),
      );
    }
  } catch (error) {
    console.log(error);
    res.send(
      encrypt(
        { status: STATUS_CODES.GENERIC_ERROR },
        req.headers.authorization,
      ),
    );
  }
});

doctorsRouter.get("/saved/:timestamp", async (req: Request, res: Response) => {
  const timestamp: number = parseInt(req.params.timestamp);
  try {
    if (collections.posts && collections.doctors) {
      const postIDs = (
        (await collections.doctors.findOne({
          publicKey: req.headers.authorization,
        })) as Doctor
      ).saved;
      if (postIDs.length == 0)
        return res.send(
          encrypt(
            { posts: [], status: STATUS_CODES.SUCCESS },
            req.headers.authorization,
          ),
        );
      const posts = (await collections.posts
        .find({
          _id: {
            $in: postIDs.map((v) => new ObjectId(v)),
          },
          timestamp: { $gt: timestamp },
        })
        .sort({ timestamp: -1 })
        .limit(8)
        .toArray()) as unknown as Post[];
      // this is hell
      res.send(
        encrypt(
          {
            posts: await Promise.all(
              posts.map(async (v) => ({
                ...v,
                images: await Promise.all(
                  v.images.map(async (v) => await generateSignedUrl(v)),
                ),
              })),
            ),
            status: STATUS_CODES.SUCCESS,
          },
          req.headers.authorization,
        ),
      );
    }
  } catch (error) {
    console.log(error);
    res.send(
      encrypt(
        { status: STATUS_CODES.GENERIC_ERROR },
        req.headers.authorization,
      ),
    );
  }
});
