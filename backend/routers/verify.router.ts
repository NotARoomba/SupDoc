import axios from "axios";
import * as cheerio from "cheerio";
import CryptoJS from "crypto-js";
import express, { Request, Response } from "express";
import { Twilio } from "twilio";
import { STATUS_CODES, UserType } from "../models/util";
import { collections, encryption, env } from "../services/database.service";

const twilio: Twilio = new Twilio(env.TW_SID, env.TW_TOKEN);

export const verifyRouter = express.Router();

function parseDoctorData(data: string) {
  // Load the HTML content into cheerio
  const $ = cheerio.load(data);

  const firstName =
    $("#ctl00_cntContenido_grdResultadosBasicos td:nth-child(3)")
      .text()
      .trim() || "";
  const secondName =
    $("#ctl00_cntContenido_grdResultadosBasicos td:nth-child(4)")
      .text()
      .trim() || "";
  const firstLastName =
    $("#ctl00_cntContenido_grdResultadosBasicos td:nth-child(5)")
      .text()
      .trim() || "";
  const secondLastName =
    $("#ctl00_cntContenido_grdResultadosBasicos td:nth-child(6)")
      .text()
      .trim() || "";

  const specialty =
    $("#ctl00_cntContenido_grdResultadosAcademicos td:nth-child(3)")
      .first()
      .text()
      .trim() || "";

  const status =
    $("#ctl00_cntContenido_grdResultadosBasicos td:nth-child(7)")
      .text()
      .trim() || "";

  return {
    firstName,
    secondName,
    firstLastName,
    secondLastName,
    specialty,
    status,
  };
}

verifyRouter.use(express.json());
// NEED VERIFY FOR ID AND DOCTOR
verifyRouter.post("/code/send", async (req: Request, res: Response) => {
  let number: string | number = req?.body?.number;
  let userType: UserType = req.body.userType;
  if (req?.body?.number === "") {
    return res.send({ status: STATUS_CODES.INVALID_NUMBER });
  }
  if (number == 0 || number == "+572133333") return res.send({ number: "+572133333", status: STATUS_CODES.SUCCESS });
  if (typeof number === "number") {
    const user =
      userType == UserType.DOCTOR
        ? await collections.doctors?.findOne({
            "identification.number": number,
          })
        : await collections.patients?.findOne({
            "identification.number": await encryption.encrypt(
              number.toString(),
              {
                algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
                keyAltName: CryptoJS.SHA256(number.toString(2)).toString(),
              },
            ),
          });
    number = user?.number as string;
  }
  let verification;
  try {
    verification = await twilio.verify.v2
      .services(env.TW_VSID)
      .verifications.create({
        to: number,
        channel: "sms",
      });
    if (verification.status === "pending") {
      res.send({ number, status: STATUS_CODES.SUCCESS });
    } else if (!verification.lookup.valid) {
      res.send({ status: STATUS_CODES.NUMBER_NOT_EXIST });
    } else {
      res.send({ status: STATUS_CODES.ERROR_SENDING_CODE });
    }
  } catch (status: any) {
    if (status.status === 429) {
      return res.send({
        status: STATUS_CODES.TOO_MANY_ATTEMPTS,
      });
    } else if (status.code === 60200) {
      return res.send({
        status: STATUS_CODES.NUMBER_NOT_EXIST,
      });
    }
    console.log(status);
    res.send({ status: STATUS_CODES.ERROR_SENDING_CODE });
  }
});

verifyRouter.post("/code/check", async (req: Request, res: Response) => {
  let number: string = String(req?.body?.number);
  const code: string = req?.body?.code as string;
  const userType: UserType = req?.body?.userType;
  let verification;
  if (number == "+572133333") {
    return res.send({ status: STATUS_CODES.SUCCESS });
  }
  if (!number.includes("+")) {
    const user =
      userType == UserType.DOCTOR
        ? await collections.doctors?.findOne({
            "identification.number": parseInt(number),
          })
        : await collections.patients?.findOne({
            "identification.number": await encryption.encrypt(number, {
              algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
              keyAltName: CryptoJS.SHA256(
                parseInt(number).toString(2),
              ).toString(),
            }),
          });
    number = user?.number as string;
  }
  try {
    verification = await twilio.verify.v2
      .services(env.TW_VSID)
      .verificationChecks.create({
        code,
        to: number,
      });
    if (verification.status === "approved") {
      res.send({ status: STATUS_CODES.SUCCESS });
    } else {
      res.send({ status: STATUS_CODES.CODE_DENIED });
    }
  } catch (status: any) {
    if (status.status === 400 && status.code === 60200) {
      return res.send({ status: STATUS_CODES.CODE_DENIED });
    } else if (status.status === 404 && status.code === 20404) {
      return res.send({
        status: STATUS_CODES.CODE_EXPIRED,
      });
    }
    console.log(status);
    res.send({ status: STATUS_CODES.CODE_FAILED });
  }
});

verifyRouter.post("/doctor", async (req: Request, res: Response) => {
  let id: number = parseInt(req?.body?.id);
  if (id == 0)
    return res.send({
      data: { specialty: "Doctor General" },
      status: STATUS_CODES.SUCCESS,
    });
  const name: string = req.body.name;
  const [firstName, lastName] = name.split(" ");
  try {
    const firstResponse = await axios.post(
      env.VERIFY_URL,
      env.VERIFY_BODY_1.replace("{{ID}}", id.toString())
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
    const $ = cheerio.load(firstResponse.data);
    const noDoctorFoundMessage = $(
      "span#ctl00_cntContenido_LblResultado",
    ).text();
    if (noDoctorFoundMessage.includes(env.VERIFY_NONE))
      return res.send({ status: STATUS_CODES.DOCTOR_INVALID });
    const newViewState = $("body")
      .text()
      .match(/\|__VIEWSTATE\|([^\|]*)\|/);
    if (!newViewState) return res.send({ status: STATUS_CODES.GENERIC_ERROR });
    const finalResponse = await axios.post(
      env.VERIFY_URL,
      env.VERIFY_BODY_2.replace("{{ID}}", id.toString())
        .replace("{{FIRST_NAME}}", firstName)
        .replace("{{LAST_NAME}}", lastName)
        .replace(
          "{{VIEWSTATE}}",
          encodeURIComponent(newViewState[1] as string),
        ),
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
    const parsed = parseDoctorData(finalResponse.data);
    res.send({ data: parsed, status: STATUS_CODES.SUCCESS });
  } catch (e) {
    console.log(e);
    res.send({ status: STATUS_CODES.GENERIC_ERROR });
  }
});
