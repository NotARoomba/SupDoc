import { ObjectId } from "mongodb";
import {
  collections,
  createKey,
  encryption,
} from "../services/database.service";
import Post from "./post";
import STATUS_CODES from "./status";
import { User } from "./user";
import CryptoJS from "crypto-js";

export default interface Comment {
  _id: ObjectId;
  name: string; // NAME OF DOCTOR OR UNKNOWN
  commenter: ObjectId; // D // DOCUMENT ID
  parent: ObjectId | null;
  text: string; // R
  likes: ObjectId[]; // D
  reports: ObjectId[];
  replies: Comment[];
  timestamp: number; // D
}

export function flattenComments(comments: Comment[]): Comment[] {
  return comments.flatMap((comment) => [
    comment,
    ...flattenComments(comment.replies),
  ]);
}

export function findCommentById(
  comments: Comment[],
  commentId: ObjectId,
): Comment | null {
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

export async function likeComment(
  post: Post,
  commentID: ObjectId,
  userID: ObjectId,
): Promise<{ status: STATUS_CODES; comments?: Comment[]; like?: boolean }> {
  // Find the post and comment
  try {
    let like = false;
    if (!post) {
      return { status: STATUS_CODES.POST_NOT_FOUND };
    }

    // Find the specific comment within the post's comments
    const comment = findCommentById(post.comments, commentID);
    if (!comment) {
      return { status: STATUS_CODES.COMMENT_NOT_FOUND };
    }

    // Toggle like (if user already liked, remove; otherwise, add)
    if (comment.likes.some((like) => like.equals(userID))) {
      comment.likes = comment.likes.filter((like) => !like.equals(userID));
    } else {
      like = true;
      comment.likes.push(userID as ObjectId);
    }

    // Update the post with the modified comment
    const updated = await collections.posts.updateOne(
      { _id: post._id },
      { $set: { comments: post.comments } },
    );
    if (updated.acknowledged)
      return { status: STATUS_CODES.SUCCESS, comments: post.comments, like };
    else return { status: STATUS_CODES.GENERIC_ERROR };
  } catch (error) {
    console.error(error);
    return { status: STATUS_CODES.GENERIC_ERROR };
  }
}

export async function addCommentToPost(
  post: Post,
  comment: Comment,
  user: User,
): Promise<{ status: STATUS_CODES; comments?: Comment[] }> {
  const keyId = await createKey([
    CryptoJS.SHA256(user._id?.toString() as string).toString(),
  ]);

  comment.parent = comment.parent ? new ObjectId(comment.parent) : null;

  if (!comment.parent && !("name" in user)) {
    return { status: STATUS_CODES.COMMENT_NOT_ALLOWED };
  }

  const commentDocument = {
    _id: new ObjectId(),
    name: "name" in user ? user.name : "Patient",
    commenter: user._id,
    text: await encryption.encrypt(comment.text, {
      keyId,
      algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
    }),
    parent: comment.parent,
    likes: [],
    reports: [],
    replies: [],
    timestamp: Date.now(),
  } as unknown as Comment;

  if (comment.parent) {
    // Check for replies
    const parentComment = findCommentById(post.comments, comment.parent);
    if (!parentComment) {
      return { status: STATUS_CODES.DOES_NOT_EXIST };
    }
    parentComment.replies.push(commentDocument);
  } else {
    // Check for top-level comments
    if (post.comments.length > 2)
      return { status: STATUS_CODES.COMMENT_LIMIT_REACHED };
    if (!("name" in user)) return { status: STATUS_CODES.COMMENT_NOT_ALLOWED };
    if (
      post.comments.some((c) =>
        c.commenter.equals(new ObjectId(comment.commenter)),
      )
    )
      return { status: STATUS_CODES.ALREADY_COMMENTED };

    post.comments.push(commentDocument);
  }

  // Update the post with the new comments
  const updatedPost = await collections.posts.findOneAndUpdate(
    { _id: post._id },
    { $set: { comments: post.comments } },
    { returnDocument: "after" },
  );

  if (updatedPost) {
    return { status: STATUS_CODES.SUCCESS, comments: updatedPost.comments };
  } else {
    return { status: STATUS_CODES.GENERIC_ERROR };
  }
}
