import { ObjectId } from "mongodb";
import { collections } from "../services/database.service";
import Post from "./post";
import STATUS_CODES from "./status";

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
  return comments.flatMap(comment => [
    comment, 
    ...flattenComments(comment.replies)
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
): Promise<{ status: STATUS_CODES; comments?: Comment[], like?: boolean }> {
  // Find the post and comment
  try {
    let like = false;
    if (!post) {
      return { status: STATUS_CODES.POST_NOT_FOUND };
    }

    // Find the specific comment within the post's comments
    const oldpostcomments = JSON.stringify(post.comments)
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
