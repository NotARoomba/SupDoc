import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import Fact from "../models/fact";
import { STATUS_CODES } from "../models/util";
import { collections } from "../services/database.service";
import { encrypt } from "../services/encryption.service";
import { generateSignedUrl, uploadImageToStorage } from "../services/storage.service";
import multer from 'multer'
export const imagesRouter = express.Router();

const upload = multer({storage: multer.diskStorage({}), limits: {fieldSize: 25 * 1024 * 1024}});
imagesRouter.use(express.json());

imagesRouter.get("/:name",  async (req: Request, res: Response) => {
    const name = req.params.name;
  try {
    const url = await generateSignedUrl(name);
    if (url)
      res
        .status(200)
        .send(
          encrypt(
            { url, status: STATUS_CODES.SUCCESS },
            req.headers.authorization,
          ),
        );
    else
      res
        .status(200)
        .send(
          encrypt(
            { status: STATUS_CODES.GENERIC_ERROR },
            req.headers.authorization,
          ),
        );
  } catch (error) {
    console.error("Error fetching image:", error);
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

imagesRouter.post("/upload", upload.array('image'), async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length == 0) return res
  .status(200)
  .send({ status: STATUS_CODES.ERROR_UPLOADING_IMAGE }
    );
  try {
    const urls = await Promise.all(
        files.map(
          async (image: any) => await uploadImageToStorage(image),
        ),
      );
      console.log(urls);
      if (!urls || urls.every((url) => url === null))
      return res
      .status(200)
      .send(
          { status: STATUS_CODES.ERROR_UPLOADING_IMAGE }
      );
      if (urls)
        return res
          .status(200)
          .send(
              { urls, status: STATUS_CODES.SUCCESS }
          );
      else
        return res
          .status(200)
          .send(
              { status: STATUS_CODES.GENERIC_ERROR }
          );
    } catch (error) {
    console.error("Error uploading image:", error);
    res
      .status(200)
      .send(
          { status: STATUS_CODES.GENERIC_ERROR }
      );
  }
});
