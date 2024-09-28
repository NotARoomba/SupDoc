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

function findCommentById(comments: Comment[], commentId: ObjectId): Comment | null {
  for (let comment of comments) {
    if (comment._id.equals(commentId)) {
      return comment;
    }
    const foundInReplies = findCommentById(comment.replies, commentId);
    if (foundInReplies) {
      return foundInReplies;
    }
  }
  return null;
}


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
  // await createKey([
  //   comment.doctor,
  // ]);
  const comment: Comment = req.body;
  const postID = new ObjectId(req.params.id);
  const keyAltName = comment.commenter.toString();
  const doctor = (await collections.doctors.findOne({
    publicKey: req.headers.authorization,
  })) as Doctor;
  const patient = (await collections.patients.findOne({
    publicKey: req.headers.authorization,
  })) as Patient;
  const user = doctor ? doctor : patient;
  comment.parent = comment.parent ? new ObjectId(comment.parent) : null;

  // Fetch the parent post
  let parentPost = await collections.posts.findOne({
    _id: postID,
  }) as Post;

  if (!parentPost) {
    return res.status(200).send(
      encrypt(
        { status: STATUS_CODES.DOES_NOT_EXIST },
        req.headers.authorization,
      ),
    );
  }
  const commentDocument = {
    _id: new ObjectId(),
    name: doctor ? doctor.name : "Patient",
    commenter: user._id,
    text: await encryption.encrypt(comment.text, {
      keyAltName,
      algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
    }) as unknown as string,
    parent: comment.parent,
    likes: [],
    reports: [],
    replies: [],
    timestamp: Date.now()
  } as Comment

  // Check if the comment is a reply to an existing comment
  if (comment.parent) {
    // Find the parent comment within the post's comments array
    let parentComment = findCommentById(parentPost.comments, comment.parent);

    if (!parentComment) {
      return res.status(200).send(
        encrypt(
          { status: STATUS_CODES.DOES_NOT_EXIST },
          req.headers.authorization,
        ),
      );
    }

    // Add the reply to the parent comment's replies array
    parentComment.replies.push(commentDocument);

  } else {
    // The comment is a top-level comment, add it to the post's comments array
    if (parentPost.comments.length > 2) {
      return res.status(200).send(
        encrypt(
          { status: STATUS_CODES.COMMENT_LIMIT_REACHED },
          req.headers.authorization,
        ),
      );
    }

    if (patient) {
      return res.status(200).send(
        encrypt(
          { status: STATUS_CODES.COMMENT_NOT_ALLOWED },
          req.headers.authorization,
        ),
      );
    }

    // Check if the doctor has already commented
    if (parentPost.comments.some(c => c.commenter.equals(new ObjectId(comment.commenter)))) {
      return res.status(200).send(
        encrypt(
          { status: STATUS_CODES.ALREADY_COMMENTED },
          req.headers.authorization,
        ),
      );
    }

    // Add the new comment to the post's comments array
    parentPost.comments.push(commentDocument);
  }

  // Update the post in the database with the modified comments
  console.log(parentPost.comments)
  const updated = await collections.posts.updateOne(
    { _id: postID },
    { $set: { comments: parentPost.comments } }
  );

  if (updated.acknowledged) {
    return res.status(200).send(
      encrypt({ comments: parentPost.comments,status: STATUS_CODES.SUCCESS }, req.headers.authorization),
    );
  } else {
    return res.status(200).send(
      encrypt(
        { status: STATUS_CODES.GENERIC_ERROR },
        req.headers.authorization,
      ),
    );
  }
});


postsRouter.post("/:postID/comments/:commentID/like", async (req: Request, res: Response) => {
  const postID = new ObjectId(req.params.postID);
  const commentID = new ObjectId(req.params.commentID);

  // Fetch doctor or patient based on authorization token
  const doctor = (await collections.doctors.findOne({
    publicKey: req.headers.authorization,
  })) as Doctor;

  const patient = (await collections.patients.findOne({
    publicKey: req.headers.authorization,
  })) as Patient;

  const user = doctor ? doctor : patient;

  try {
    // Find the post and comment
    const post = await collections.posts.findOne({ _id: postID }) as Post;
    if (!post) {
      return res.status(200).send(
        encrypt(
          { status: STATUS_CODES.POST_NOT_FOUND },
          req.headers.authorization
        )
      );
    }

    // Find the specific comment within the post's comments
    const comment = findCommentById(post.comments, commentID);
    if (!comment) {
      return res.status(404).send(
        encrypt(
          { status: STATUS_CODES.COMMENT_NOT_FOUND },
          req.headers.authorization
        )
      );
    }

    // Toggle like (if user already liked, remove; otherwise, add)
    if (comment.likes.some(like => like.equals(user._id))) {
      comment.likes = comment.likes.filter(like => !like.equals(user._id));
    } else {
      comment.likes.push(user._id as ObjectId);
    }

    // Update the post with the modified comment
    const updated = await collections.posts.updateOne(
      { _id: postID },
      { $set: { comments: post.comments } }
    );

    if (updated.acknowledged) {
      return res.status(200).send(
        encrypt({ comments: post.comments, status: STATUS_CODES.SUCCESS }, req.headers.authorization)
      );
    } else {
      return res.status(200).send(
        encrypt(
          { status: STATUS_CODES.GENERIC_ERROR },
          req.headers.authorization
        )
      );
    }
  } catch (error) {
    console.error(error);
    return res.status(200).send(
      encrypt(
        { status: STATUS_CODES.GENERIC_ERROR },
        req.headers.authorization
      )
    );
  }
});
// Report a comment
postsRouter.post("/:postID/comments/:commentID/report", async (req: Request, res: Response) => {
  const postID = new ObjectId(req.params.postID);
  const commentID = new ObjectId(req.params.commentID);

  // Fetch doctor or patient based on authorization token
  const doctor = (await collections.doctors.findOne({
    publicKey: req.headers.authorization,
  })) as Doctor;

  const patient = (await collections.patients.findOne({
    publicKey: req.headers.authorization,
  })) as Patient;

  const user = doctor ? doctor : patient;

  try {
    // Check if the report already exists for this comment
    const existingReport = await collections.reports.findOne({
      reported: commentID,
      parent: postID,
      reporter: {
        id: user._id,
        type: doctor ? UserType.DOCTOR : UserType.PATIENT,
      },
    });

    if (existingReport) {
      return res.status(200).send(
        encrypt(
          { status: STATUS_CODES.ALREADY_REPORTED },
          req.headers.authorization
        )
      );
    }

    // Create the report
    const createdReport = await collections.reports.insertOne({
      reported: commentID,
      parent: postID,
      reporter: {
        id: user._id as ObjectId,
        type: doctor ? UserType.DOCTOR : UserType.PATIENT,
      },
      timestamp: Date.now(),
    });

    // Find the post and comment
    const post = await collections.posts.findOne({ _id: postID }) as Post;
    if (!post) {
      return res.status(200).send(
        encrypt(
          { status: STATUS_CODES.POST_NOT_FOUND },
          req.headers.authorization
        )
      );
    }

    const comment = findCommentById(post.comments, commentID);
    if (!comment) {
      return res.status(200).send(
        encrypt(
          { status: STATUS_CODES.COMMENT_NOT_FOUND },
          req.headers.authorization
        )
      );
    }

    // Add the report to the comment
    comment.reports.push(createdReport.insertedId);

    // Update the post with the modified comment
    const updated = await collections.posts.updateOne(
      { _id: postID },
      { $set: { comments: post.comments } }
    );

    if (createdReport.acknowledged && updated.acknowledged) {
      return res.status(200).send(
        encrypt({ status: STATUS_CODES.SUCCESS }, req.headers.authorization)
      );
    } else {
      return res.status(200).send(
        encrypt(
          { status: STATUS_CODES.GENERIC_ERROR },
          req.headers.authorization
        )
      );
    }
  } catch (error) {
    console.error(error);
    return res.status(200).send(
      encrypt(
        { status: STATUS_CODES.GENERIC_ERROR },
        req.headers.authorization
      )
    );
  }
});

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
      const doctor = (await collections.doctors.findOne({
        publicKey: req.headers.authorization,
      })) as Doctor;
      if (
        await collections.reports.findOne({
          reported: id,
          reporter: { id: doctor._id, type: UserType.DOCTOR },
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
        reported: id,
        reporter: { id: doctor._id, type: UserType.DOCTOR },
      } as Report);
      const updated = await collections.posts.updateOne(
        { _id: id },
        {
          $push: {
            reports: created.insertedId,
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
