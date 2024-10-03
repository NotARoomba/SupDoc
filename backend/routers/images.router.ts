import express, { Request, Response } from "express";
import { STATUS_CODES } from "../models/util";
import { encrypt } from "../services/encryption.service";
import {
  generateSignedUrl,
  removeImageFromStorage,
  upload,
  uploadImageToStorage,
} from "../services/storage.service";
export const imagesRouter = express.Router();

imagesRouter.use(express.json());

imagesRouter.get("/:image", async (req: Request, res: Response) => {
  const image = req.params.image;
  try {
    const url = await generateSignedUrl(image);
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

imagesRouter.get("/:image/delete", async (req: Request, res: Response) => {
  const image = req.params.image;
  try {
    const del = await removeImageFromStorage(image);
    if (del)
      res
        .status(200)
        .send(
          encrypt({ status: STATUS_CODES.SUCCESS }, req.headers.authorization),
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

imagesRouter.post(
  "/upload",
  upload.array("files"),
  async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];
    // console.log(req.files);
    if (!files || files.length == 0)
      return res
        .status(200)
        .send({ status: STATUS_CODES.ERROR_UPLOADING_IMAGE });
    try {
      const urls = await Promise.all(
        files.map(async (image) => await uploadImageToStorage(image.path)),
      );
      // console.log(urls);
      if (!urls || urls.every((url) => url === null))
        return res
          .status(200)
          .send({ status: STATUS_CODES.ERROR_UPLOADING_IMAGE });
      if (urls)
        return res.status(200).send({ urls, status: STATUS_CODES.SUCCESS });
      else return res.status(200).send({ status: STATUS_CODES.GENERIC_ERROR });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(200).send({ status: STATUS_CODES.GENERIC_ERROR });
    }
  },
);
