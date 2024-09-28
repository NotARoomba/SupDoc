import express, { Request, Response } from "express";
import { DeleteResult, ObjectId, PushOperator } from "mongodb";
import Comment from "../models/comment";
import { Doctor } from "../models/doctor";
import Patient from "../models/patient";
import Post from "../models/post";
import Report from "../models/report";
import { STATUS_CODES, UserType } from "../models/util";
import { collections, createKey, encryption } from "../services/database.service";
import { encrypt } from "../services/encryption.service";
import { generateSignedUrl } from "../services/storage.service";
import { data } from "cheerio/dist/commonjs/api/attributes";

export const postsRouter = express.Router();

postsRouter.use(express.json());

const getCommentsWithReplies = async (post: ObjectId) => {
  const comments = await collections.comments
    .aggregate([
      // Match comments that belong to the specific post
      {
        $match: { post: post.toString(), parent: { $exists: false } },
      },
      // Recursively look up replies
      {
        $graphLookup: {
          from: "comments", // The collection to search
          startWith: "$_id", // Start with the comment _id
          connectFromField: "_id", // Match the _id of the parent comment
          connectToField: "parent", // The field in replies that refers to the parent comment
          as: "replies", // Output the replies as a field called 'replies'
          depthField: "level", // Optional: to add a field specifying the depth of recursion
          // maxDepth: 3              // Optional: set the maximum depth of replies (recursive levels)
        },
      },
      // Sort by timestamp (newest to oldest or oldest to newest)
      {
        $sort: { timestamp: 1 }, // Oldest first (use -1 for newest first)
      },
    ])
    .toArray();
    console.log(comments)
  return comments;
};
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
              comments: await getCommentsWithReplies(new ObjectId(id)),
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
  const patient = (await collections.patients.findOne({
    publicKey: req.headers.authorization,
  })) as Patient;
  data.patient = patient.identification.number;

  const keyAltName = data.patient.toString(2);
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
        info: await encryption.encrypt(patient.info, {
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
              posts: postInsert.insertedId.toString(),
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
  const comment: Comment = req.body;
  const postID = req.params.id;
  // if comment has a parent then get the parent and add the id as a child
  // if the comment does not have a parent then get the postID and run checks if the comment is able to be placed, if not then throw an error, else add the comment ID to the array of comments
  // DOCTOR IS DOCTOR ID NOT IDENTIFICATION
  // await createKey([
  //   comment.doctor,
  // ]);
  if (comment.parent) {
    const parentComment = (await collections.comments.findOne({
      _id: new ObjectId(comment.parent),
    })) as unknown as Comment;
    if (!parentComment)
      return res
        .status(200)
        .send(
          encrypt(
            { status: STATUS_CODES.DOES_NOT_EXIST },
            req.headers.authorization,
          ),
        );
    const insComment = await collections.comments.insertOne({
      // Comment fields
      post: await encryption.encrypt(postID, {
        keyAltName: comment.doctor,
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
      }),

      parent: await encryption.encrypt(comment.parent, {
        keyAltName: comment.doctor,
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
      }),

      doctor: await encryption.encrypt(comment.doctor, {
        keyAltName: comment.doctor,
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
      }),

      text: await encryption.encrypt(comment.text, {
        keyAltName: comment.doctor,
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
      }),

      likes: [],

      reports: [],

      replies: [],

      timestamp: Date.now(),
    });
    const updated = await collections.comments.updateOne(
      { _id: new ObjectId(parentComment._id) },
      {
        $set: {
          replies: [
            ...parentComment.replies,
            await encryption.encrypt(insComment?.insertedId.toString(), {
              algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
              keyAltName: comment.doctor,
            }),
          ],
        },
      },
    );
    if (updated?.acknowledged) {
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
  } else {
    const parentPost = (await collections.posts.findOne({
      _id: new ObjectId(comment.post),
    })) as unknown as Post;
    if (!parentPost)
      return res
        .status(200)
        .send(
          encrypt(
            { status: STATUS_CODES.DOES_NOT_EXIST },
            req.headers.authorization,
          ),
        );
    if (parentPost.comments.length > 2)
      return res
        .status(200)
        .send(
          encrypt(
            { status: STATUS_CODES.COMMENT_LIMIT_REACHED },
            req.headers.authorization,
          ),
        );
    if (parentPost.comments.includes(comment.doctor))res
    .status(200)
    .send(
      encrypt(
        { status: STATUS_CODES.ALREADY_COMMENTED },
        req.headers.authorization,
      ),
    );
    const insComment = await collections.comments.insertOne({
      // Comment fields
      post: await encryption.encrypt(postID, {
        keyAltName: comment.doctor,
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
      }),

      parent: null,

      doctor: await encryption.encrypt(comment.doctor, {
        keyAltName: comment.doctor,
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
      }),

      text: await encryption.encrypt(comment.text, {
        keyAltName: comment.doctor,
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
      }),

      likes: [],

      reports: [],

      replies: [],

      timestamp: Date.now(),
    });
    const updated = await collections.posts.updateOne(
      { _id: new ObjectId(parentPost._id) },
      {
        $set: {
          comments: [
            ...parentPost.comments,
            await encryption.encrypt(insComment?.insertedId, {
              algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
              keyAltName: comment.doctor,
            }),
          ],
        },
      },
    );
    if (updated?.acknowledged) {
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
  }
});

postsRouter.post("/comments/:id/like", async (req: Request, res: Response) => {
  const commentId = req.params.id;
  const doctor = (await collections.doctors.findOne({
    publicKey: req.headers.authorization,
  })) as Doctor;
  const patient = (await collections.patients.findOne({
    publicKey: req.headers.authorization,
  })) as Patient;
  const user = doctor ? doctor : patient;

  try {
    const updated = await collections.comments.updateOne(
      { _id: new ObjectId(commentId) },
      [
        {
          $set: {
            likes: {
              $cond: {
                if: { $in: [user.identification.number, "$likes"] }, // If already liked, remove the like
                then: {
                  $setDifference: ["$likes", [user.identification.number]],
                },
                else: {
                  $concatArrays: ["$likes", [user.identification.number]],
                }, // If not liked, add the like
              },
            },
          },
        },
      ],
    );

    if (updated?.acknowledged) {
      return res
        .status(200)
        .send(
          encrypt({ status: STATUS_CODES.SUCCESS }, req.headers.authorization),
        );
    } else {
      return res
        .status(500)
        .send(
          encrypt(
            { status: STATUS_CODES.GENERIC_ERROR },
            req.headers.authorization,
          ),
        );
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(
        encrypt(
          { status: STATUS_CODES.GENERIC_ERROR },
          req.headers.authorization,
        ),
      );
  }
});

// Report a comment
postsRouter.post(
  "/comments/:id/report",
  async (req: Request, res: Response) => {
    const commentId = req.params.id;

    const doctor = (await collections.doctors.findOne({
      publicKey: req.headers.authorization,
    })) as Doctor;
    const patient = (await collections.patients.findOne({
      publicKey: req.headers.authorization,
    })) as Patient;
    const user = doctor ? doctor : patient;

    try {
      if (
        await collections.reports.findOne({
          reported: new ObjectId(commentId),
          reporter: {
            id: user.identification.number,
            type: doctor ? UserType.DOCTOR : UserType.PATIENT,
          },
        })
      ) {
        return res.send(
          encrypt(
            { status: STATUS_CODES.ALREADY_REPORTED },
            req.headers.authorization,
          ),
        );
      }

      const createdReport = await collections.reports.insertOne({
        reported: new ObjectId(commentId),
        reporter: {
          id: user.identification.number,
          type: doctor ? UserType.DOCTOR : UserType.PATIENT,
        },
        timestamp: Date.now(),
      });
      const updatedComment = await collections.comments.updateOne(
        { _id: new ObjectId(commentId) },
        {
          $push: {
            reports: createdReport.insertedId.toString(),
          } as PushOperator<Document>,
        },
      );

      if (createdReport.acknowledged && updatedComment.acknowledged) {
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
          .status(500)
          .send(
            encrypt(
              { status: STATUS_CODES.GENERIC_ERROR },
              req.headers.authorization,
            ),
          );
      }
    } catch (error) {
      console.log(error);
      return res
        .status(500)
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
  const id = req?.params?.id;
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
  const id = req?.params?.id;
  try {
    if (collections.posts && collections.doctors && collections.reports) {
      const doctor = (await collections.doctors.findOne({
        publicKey: req.headers.authorization,
      })) as Doctor;
      if (
        await collections.reports.findOne({
          reported: new ObjectId(id),
          reporter: { id: doctor.identification.number, type: UserType.DOCTOR },
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
        reported: new ObjectId(id),
        reporter: { id: doctor.identification.number, type: UserType.DOCTOR },
      } as Report);
      const updated = await collections.posts.updateOne(
        { _id: new ObjectId(id) },
        {
          $push: {
            reports: created.insertedId.toString(),
          } as PushOperator<Document>,
        },
      );
      if (created.acknowledged && updated.acknowledged) {
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
