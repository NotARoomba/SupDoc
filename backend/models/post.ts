import { ObjectId } from "mongodb";
import { collections } from "../services/database.service";
import { generateSignedUrl } from "../services/storage.service";
import Comment from "./comment";
import { PatientMetrics } from "./metrics";
import Patient from "./patient";
import STATUS_CODES from "./status";
import { User } from "./user";
import { UserType } from "./util";

export default interface Post {
  _id?: ObjectId;
  title: string; // D
  images: string[]; // R
  description: string;
  info: PatientMetrics;
  patient: ObjectId; // D
  timestamp: number; // D
  comments: Comment[]; // M
  reports: ObjectId[];
}

export async function getPosts(
  userType: UserType,
  user: User,
  timestamp: number,
): Promise<{
  status: STATUS_CODES;
  posts?: Post[];
}> {
  try {
    let posts: Post[];

    if (userType === UserType.DOCTOR) {
      posts = (await collections.posts
        .find({ timestamp: { $lt: timestamp } })
        .sort({ timestamp: -1 })
        .limit(8)
        .toArray()) as Post[];
    } else {
      // const postIds = (user as Patient).posts.map((id: string) => new ObjectId(id));
      posts = (await collections.posts
        .find({ _id: { $in: (user as Patient).posts } })
        .sort({ _id: -1 })
        .toArray()) as Post[];
    }

    const enrichedPosts = await Promise.all(
      posts.map(async (post) => ({
        ...post,
        images: await Promise.all(post.images.map(generateSignedUrl)),
      })),
    );

    // // Join user to WebSocket rooms for the retrieved posts
    // for (const post of enrichedPosts) {
    //   const socket = io.sockets.sockets.get(user._id.toString());
    //   await socket?.join(post._id?.toString());
    // }

    return { status: STATUS_CODES.SUCCESS, posts: enrichedPosts };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return { status: STATUS_CODES.GENERIC_ERROR };
  }
}
