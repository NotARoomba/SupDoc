import express, { Request, Response } from "express";
import { DeleteResult, ObjectId, PushOperator } from "mongodb";
import Comment from "../models/comment";
import Post from "../models/post";
import { STATUS_CODES } from "../models/util";
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
      res
        .status(200)
        .send(
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
  if (!data.patient) {
    const patient = await collections.patients?.findOne({
      publicKey: req.headers.authorization,
    });
    if (patient) data.patient = patient.identification.number;
    else
      return res.send(
        encrypt(
          { status: STATUS_CODES.USER_NOT_FOUND },
          req.headers.authorization,
        ),
      );
  }
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
        timestamp: Date.now(),

        // Include empty arrays for comments and reports
        comments: [],
        reports: [],
      });
      if (postInsert.acknowledged) {
        await collections.patients?.updateOne(
          {
            publicKey: req.headers.authorization,
          },
          {
            $push: {
              posts: postInsert.insertedId.toString(),
            } as PushOperator<Document>,
          },
        );
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
  // if comment has a parent then get the parent and add the id as a child
  // if the comment does not have a parent then get the postID and run checks if the comment is able to be placed, if not then throw an error, else add the comment ID to the array of comments
  // DOCTOR IS DOCTOR ID NOT IDENTIFICATION
  const keyAltName = comment.doctor.toString(2);
  if (comment.parent) {
    const parentComment = (await collections.comments?.findOne({
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
    const insComment = await collections.comments?.insertOne({
      // Comment fields
      postId: await encryption.encrypt(comment.postId, {
        keyAltName,
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
      }),

      parent: await encryption.encrypt(comment.parent, {
        keyAltName,
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
      }),

      doctor: await encryption.encrypt(comment.doctor, {
        keyAltName,
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
      }),

      text: await encryption.encrypt(comment.text, {
        keyAltName,
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
      }),

      likes: [],

      reports: [],

      children: [],

      timestamp: await encryption.encrypt(Date.now(), {
        keyAltName,
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
      }),
    });
    const updated = await collections.comments?.updateOne(
      { _id: new ObjectId(parentComment._id) },
      {
        $set: {
          children: [
            ...parentComment.children,
            await encryption.encrypt(insComment?.insertedId.toString(), {
              algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
              keyAltName: comment.doctor.toString(2),
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
    const parentPost = (await collections.posts?.findOne({
      _id: new ObjectId(comment.postId),
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
    const insComment = await collections.comments?.insertOne({
      // Comment fields
      postId: await encryption.encrypt(comment.postId, {
        keyAltName,
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
      }),

      parent: await encryption.encrypt(null, {
        keyAltName,
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
      }),

      doctor: await encryption.encrypt(comment.doctor, {
        keyAltName,
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
      }),

      text: await encryption.encrypt(comment.text, {
        keyAltName,
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
      }),

      likes: [],

      reports: [],

      children: [],

      timestamp: await encryption.encrypt(comment.timestamp, {
        keyAltName,
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
      }),
    });
    const updated = await collections.posts?.updateOne(
      { _id: new ObjectId(parentPost._id) },
      {
        $set: {
          comments: [
            ...parentPost.comments,
            await encryption.encrypt(insComment?.insertedId, {
              algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
              keyAltName: comment.doctor.toString(2),
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
                       $cond: [ { $in: [ id, "$arr" ] }, 
                                { $setDifference: [ "$arr", [ id ] ] }, 
                                { $concatArrays: [ "$arr", [ id ] ] } 
                       ] 
                   }
               }
          }
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