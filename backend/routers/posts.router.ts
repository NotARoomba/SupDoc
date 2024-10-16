import CryptoJS from "crypto-js";
import express, { Request, Response } from "express";
import { DeleteResult, ObjectId, PushOperator } from "mongodb";
import Comment, {
  addCommentToPost,
  findCommentById,
  likeComment,
} from "../models/comment";
import Post from "../models/post";
import Report from "../models/report";
import STATUS_CODES from "../models/status";
import { User } from "../models/user";
import { UserType } from "../models/util";
import { collections, encryption } from "../services/database.service";
import { encrypt } from "../services/encryption.service";
import { generateSignedUrl } from "../services/storage.service";

export const postsRouter = express.Router();

postsRouter.use(express.json());

// GETS POST FROM POST ID
postsRouter.get("/:id", async (req: Request, res: Response) => {
  //check if doctor
  const id = req?.params?.id;
  try {
    let post: Post | null = null;
    if (collections.posts) {
      post = (await collections.posts.findOne({
        _id: new ObjectId(id),
      })) as unknown as Post;
    }
    if (post) {
      res.status(200).send(
        encrypt(
          {
            post: {
              ...post,
              images: await Promise.all(
                post.images.map(async (v) => await generateSignedUrl(v)),
              ),
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
            post: null,
            status: STATUS_CODES.POST_NOT_FOUND,
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

postsRouter.get("/:id/delete", async (req: Request, res: Response) => {
  const id = req?.params?.id;
  try {
    let post: DeleteResult | null = null;
    if (collections.posts) {
      post = await collections.posts.deleteOne({
        _id: new ObjectId(id),
      });
    }
    if (post && post.acknowledged) {
      res
        .status(200)
        .send(
          encrypt({ status: STATUS_CODES.SUCCESS }, req.headers.authorization),
        );
    } else {
      res.status(404).send(
        encrypt(
          {
            status: STATUS_CODES.ERROR_DELETING_POST,
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

postsRouter.post("/create", async (req: Request, res: Response) => {
  const data: Post = req.body;
  if (!res.locals.patient._id)
    return res.send(
      encrypt(
        { status: STATUS_CODES.USER_NOT_FOUND },
        req.headers.authorization,
      ),
    );
  data.patient = res.locals.patient._id;

  const keyAltName = CryptoJS.SHA256(data.patient.toString()).toString();
  try {
    if (collections.posts) {
      const postInsert = await collections.posts.insertOne({
        // Post fields
        title: await encryption.encrypt(data.title, {
          keyAltName,
          algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
        }),
        images: await encryption.encrypt(data.images, {
          keyAltName,
          algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
        }),
        description: await encryption.encrypt(data.description, {
          keyAltName,
          algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
        }),
        patient: await encryption.encrypt(data.patient, {
          keyAltName,
          algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
        }),
        info: await encryption.encrypt(res.locals.patient.info, {
          keyAltName,
          algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
        }),
        timestamp: Date.now(),

        // Include empty arrays for comments and reports
        comments: [],
        reports: [],
      });
      if (postInsert.acknowledged) {
        await collections.patients.updateOne(
          {
            publicKey: req.headers.authorization,
          },
          {
            $push: {
              posts: postInsert.insertedId,
            } as PushOperator<Document>,
          },
        );
        res.status(200).send(
          encrypt(
            {
              post: {
                ...data,
                _id: postInsert.insertedId,
                images: await Promise.all(
                  data.images.map(async (v) => await generateSignedUrl(v)),
                ),
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
              post: null,
              status: STATUS_CODES.GENERIC_ERROR,
            },
            req.headers.authorization,
          ),
        );
      }
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

postsRouter.post("/:id/comment", async (req: Request, res: Response) => {
  // if comment has a parent then get the parent and add the id as a child
  // if the comment does not have a parent then get the postID and run checks if the comment is able to be placed, if not then throw an error, else add the comment ID to the array of comments
  // DOCTOR IS DOCTOR ID NOT IDENTIFICATION

  // TODOOOO MIGRATE ALL collections? to collections
  // FIX ALL TO OBJECTID
  const comment: Comment = req.body;
  console.log(comment);
  const user = (res.locals.doctor ?? res.locals.patient) as User;
  const post = (await collections.posts.findOne({
    _id: new ObjectId(req.params.id),
  })) as Post;
  const result = await addCommentToPost(post, comment, user);
  return res.status(200).send(encrypt(result, req.headers.authorization));
});

postsRouter.post(
  "/:postID/comments/:commentID/like",
  async (req: Request, res: Response) => {
    const postID = new ObjectId(req.params.postID);
    const commentID = new ObjectId(req.params.commentID);

    // Fetch doctor or patient based on authorization token
    const user = res.locals.doctor ?? res.locals.patient;

    const post = (await collections.posts.findOne({ _id: postID })) as Post;
    const result = await likeComment(post, commentID, user._id);

    return res.status(200).send(encrypt(result, req.headers.authorization));
  },
);
// Report a comment
postsRouter.post(
  "/:postID/comments/:commentID/report",
  async (req: Request, res: Response) => {
    const postID = new ObjectId(req.params.postID);
    const commentID = new ObjectId(req.params.commentID);

    // Fetch doctor or patient based on authorization token
    const user = res.locals.doctor ?? res.locals.patient;

    try {
      // Check if the report already exists for this comment
      const existingReport = await collections.reports.findOne({
        reported: { id: commentID, type: "Comment" },
        parent: postID,
        reporter: {
          id: user._id,
          type: res.locals.doctor ? UserType.DOCTOR : UserType.PATIENT,
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
        reported: { id: commentID, type: "Comment" },
        parent: postID,
        reporter: {
          id: user._id as ObjectId,
          type: res.locals.doctor ? UserType.DOCTOR : UserType.PATIENT,
        },
        reason: req.body.reason,
        evidence: req.body.evidence,
        timestamp: Date.now(),
      });

      // Find the post and comment
      const post = (await collections.posts.findOne({ _id: postID })) as Post;
      if (!post) {
        return res
          .status(200)
          .send(
            encrypt(
              { status: STATUS_CODES.POST_NOT_FOUND },
              req.headers.authorization,
            ),
          );
      }

      const comment = findCommentById(post.comments, commentID);
      if (!comment) {
        return res
          .status(200)
          .send(
            encrypt(
              { status: STATUS_CODES.COMMENT_NOT_FOUND },
              req.headers.authorization,
            ),
          );
      }

      // Add the report to the comment
      comment.reports.push(createdReport.insertedId);

      // Update the post with the modified comment
      const updated = await collections.posts.updateOne(
        { _id: postID },
        { $set: { comments: post.comments } },
      );

      const updatedUser = await (
        res.locals.doctor ? collections.doctors : collections.patients
      ).updateOne(
        { publicKey: req.headers.authorization },
        {
          $push: {
            reports: createdReport.insertedId,
          } as PushOperator<Document>,
        },
      );

      if (
        createdReport.acknowledged &&
        updated.acknowledged &&
        updatedUser.acknowledged
      ) {
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
  },
);

postsRouter.get("/:id/save", async (req: Request, res: Response) => {
  //check if doctor
  const id = new ObjectId(req?.params?.id);
  try {
    if (collections.posts && collections.doctors) {
      const updated = await collections.doctors.updateOne(
        { publicKey: req.headers.authorization },
        [
          {
            $set: {
              saved: {
                $cond: {
                  if: { $in: [id, "$saved"] }, // Check if 'id' is in the 'saved' array
                  then: { $setDifference: ["$saved", [id]] }, // Remove 'id' if it exists
                  else: { $concatArrays: ["$saved", [id]] }, // Add 'id' if it doesn't exist
                },
              },
            },
          },
        ],
      );
      if (updated.acknowledged) {
        res
          .status(200)
          .send(
            encrypt(
              { status: STATUS_CODES.SUCCESS },
              req.headers.authorization,
            ),
          );
      } else {
        res.status(404).send(
          encrypt(
            {
              status: STATUS_CODES.GENERIC_ERROR,
            },
            req.headers.authorization,
          ),
        );
      }
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

postsRouter.post("/:id/report", async (req: Request, res: Response) => {
  //check if doctor
  const report: Report = req.body;
  const id = new ObjectId(req?.params?.id);
  try {
    if (collections.posts && collections.doctors && collections.reports) {
      if (
        await collections.reports.findOne({
          reported: { id, type: "Post" },
          reporter: { id: res.locals.doctor._id, type: UserType.DOCTOR },
        })
      )
        return res.send(
          encrypt(
            { status: STATUS_CODES.ALREADY_REPORTED },
            req.headers.authorization,
          ),
        );
      const created = await collections.reports.insertOne({
        ...report,
        reported: { id, type: "Post" },
        reporter: { id: res.locals.doctor._id, type: UserType.DOCTOR },
      } as Report);
      const updatedUser = await collections.doctors.updateOne(
        { publicKey: req.headers.authorization },
        {
          $push: {
            reports: created.insertedId,
          } as PushOperator<Document>,
        },
      );
      const updatedPost = await collections.posts.updateOne(
        { _id: id },
        {
          $push: {
            reports: created.insertedId,
          } as PushOperator<Document>,
        },
      );
      if (
        created.acknowledged &&
        updatedUser.acknowledged &&
        updatedPost.acknowledged
      ) {
        res
          .status(200)
          .send(
            encrypt(
              { status: STATUS_CODES.SUCCESS },
              req.headers.authorization,
            ),
          );
      } else {
        res.status(404).send(
          encrypt(
            {
              status: STATUS_CODES.GENERIC_ERROR,
            },
            req.headers.authorization,
          ),
        );
      }
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
