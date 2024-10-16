import cors from "cors";
import { Expo, ExpoPushMessage } from "expo-server-sdk";
import express, { Request, Response } from "express";
import { createServer } from "http";
import { ObjectId } from "mongodb";
import { Server, Socket } from "socket.io";
import Comment, {
  addCommentToPost,
  flattenComments,
  likeComment,
} from "./models/comment";
import { Doctor } from "./models/doctor";
import SupDocEvents from "./models/events";
import Patient from "./models/patient";
import Post, { getPosts } from "./models/post";
import STATUS_CODES from "./models/status";
import { User } from "./models/user";
import { UserType } from "./models/util";
import { doctorsRouter } from "./routers/doctors.router";
import { factsRouter } from "./routers/facts.router";
import { imagesRouter } from "./routers/images.router";
import { patientsRouter } from "./routers/patients.router";
import { postsRouter } from "./routers/posts.router";
import { usersRouter } from "./routers/users.router";
import { verifyRouter } from "./routers/verify.router";
import {
  collections,
  connectToDatabase,
  env,
} from "./services/database.service";
import { decryptionMiddleware } from "./services/encryption.service";
import { refreshFacts } from "./services/facts.service";

export const app = express();
const httpServer = createServer(app);
const port = 3001;

// const corsOptions: CorsOptions = {
//   // allowedHeaders: 'Authorization'
// };

export const io = new Server(httpServer);

let expo = new Expo({
  accessToken: env.EXPO_ACCESS_TOKEN,
  useFcmV1: true,
});

export let usersConnected: {
  [key: string]: string[];
} = {};

connectToDatabase(io)
  .then(() => {
    app.use(cors());
    app.use(express.json({ limit: "50mb", type: "application/json" }));
    app.use(decryptionMiddleware);
    app.use("/users", usersRouter);
    app.use("/patients", patientsRouter);
    app.use("/doctors", doctorsRouter);
    app.use("/posts", postsRouter);
    app.use("/images", imagesRouter);
    app.use("/facts", factsRouter);
    app.use("/verify", verifyRouter);

    app.use("/", async (_req: Request, res: Response) => {
      res.status(200).send("You arent supposed to be here");
    });

    // WEBSICKET INITIALIZATION
    io.on(SupDocEvents.CONNECT, async (socket: Socket) => {
      console.log(`New client connected: ${socket.id}`);
      const doctorExists = await collections.doctors?.findOne({
        _id: new ObjectId(socket.handshake.query.id as string),
      });
      const patientExists = await collections.patients?.findOne({
        _id: new ObjectId(socket.handshake.query.id as string),
      });
      // await encryption.decrypt(doctorExists?.publicKey)
      if (!(doctorExists || patientExists)) return socket.disconnect(true);
      const user = (doctorExists ?? patientExists) as User;
      if (socket.handshake.query.id) {
        if (!usersConnected[socket.handshake.query.id as string])
          usersConnected[socket.handshake.query.id as string] = [socket.id];
        else
          usersConnected[socket.handshake.query.id as string].push(socket.id);
      }
      socket.on(
        SupDocEvents.POST_COMMENT,
        async (postID: ObjectId, comment: Comment, callback) => {
          const post = (await collections.posts.findOne({
            _id: new ObjectId(postID),
          })) as Post;
          const res = await addCommentToPost(post, comment, user);
          if (res.status !== STATUS_CODES.SUCCESS || !res.comments) return;
          callback(res);
          // let connections = (await getUsers(res.comments))
          //   if (!connections.includes(post.patient.toString())) connections = connections.concat(post.patient.toString())
          //   connections = connections
          // .filter((id) => usersConnected.hasOwnProperty(id) && id !== user._id?.toString())
          //   .map((id) => usersConnected[id])
          //   .flat()
          //   console.log(connections, (await getUsers(res.comments)).filter((id) => usersConnected.hasOwnProperty(id) && id !== user._id?.toString()), usersConnected)
          //   for (const conn of connections) {
          //     io.to(conn).emit(SupDocEvents.UPDATE_COMMENTS, {
          //         post: postID,
          //         comments: res.comments,
          //     });
          // }
          socket
            .to(post._id?.toString() as string)
            .emit(SupDocEvents.UPDATE_COMMENTS, {
              post: postID,
              comments: res.comments,
            });
          //check if has a parent and if not then send a notification to the user, else send a notification the the parent comment
          let messages: ExpoPushMessage[] = [];
          if (!comment.parent) {
            const pushTokens = (
              (await collections.patients.findOne({
                _id: new ObjectId(post.patient),
              })) as Patient
            ).pushTokens;
            messages = pushTokens.map((v) => ({
              to: v,
              sound: "default",
              title: "New Comment",
              body: `${doctorExists?.name as string} commented on your post`,
            }));
          } else {
            const parentComment = flattenComments(post.comments).find(
              (v) => v._id.toString() == comment.parent?.toString(),
            ) as Comment;
            const parentUser = (await collections.doctors.findOne({
              _id: new ObjectId(parentComment.commenter),
            })) as Doctor;
            if (!parentUser) return callback(res);
            const pushTokens = parentUser.pushTokens;
            messages = pushTokens.map((v) => ({
              to: v,
              sound: "default",
              title: "New Reply",
              body: `${doctorExists ? doctorExists.name : "The Patient"} replied to your comment`,
            }));
          }
          await expo.sendPushNotificationsAsync(messages);
          callback(res);
        },
      );
      socket.on(
        SupDocEvents.LIKE_COMMENT,
        async (postID: ObjectId, commentID: ObjectId, callback) => {
          const post = (await collections.posts.findOne({
            _id: new ObjectId(postID),
          })) as Post;
          const res = await likeComment(
            post,
            new ObjectId(commentID),
            user._id as ObjectId,
          );
          if (res.status !== STATUS_CODES.SUCCESS || !res.comments)
            return callback(res);
          //   let connections = (await getUsers(res.comments))
          //   if (!connections.includes(post.patient.toString())) connections = connections.concat(post.patient.toString())
          //   connections = connections
          // .filter((id) => usersConnected.hasOwnProperty(id) && id !== user._id?.toString())
          //   .map((id) => usersConnected[id])
          //   .flat()
          //   console.log(connections, (await getUsers(res.comments)).filter((id) => usersConnected.hasOwnProperty(id) && id !== user._id?.toString()), usersConnected)
          //   for (const conn of connections) {
          //     io.to(conn).emit(SupDocEvents.UPDATE_COMMENTS, {
          //         post: postID,
          //         comments: res.comments,
          //     });
          // }
          console.log(socket.rooms);
          console.log(io.in(post._id?.toString() as string).fetchSockets());
          socket
            .to(post._id?.toString() as string)
            .emit(SupDocEvents.UPDATE_COMMENTS, {
              post: postID,
              comments: res.comments,
            });

          // send notification to the author of the comment if they are not connected
          if (res.like) {
            let messages: ExpoPushMessage[] = [];
            const comment = flattenComments(post.comments).find(
              (v) => v._id.toString() == commentID.toString(),
            );
            if (comment?.name == "Patient") {
              const patient = (await collections.patients.findOne({
                _id: new ObjectId(comment.commenter),
              })) as Patient;
              if (!patient) return;
              // if (!usersConnected[patient._id?.toString() as string]) {
              messages = patient.pushTokens.map((v) => ({
                to: v,
                sound: "default",
                title: "New Like",
                body: `${doctorExists ? doctorExists.name : "The patient"} liked your comment`,
              }));
              console.log("PATIENT LIKED COMMENT");
              // }
            } else {
              if (!comment) return;
              const doctor = (await collections.doctors.findOne({
                _id: new ObjectId(comment.commenter),
              })) as Doctor;
              if (!doctor) return;
              // if (!usersConnected[doctor._id?.toString() as string]) {
              messages = doctor.pushTokens.map((v) => ({
                to: v,
                sound: "default",
                title: "New Like",
                body: `${doctorExists ? doctorExists.name : "The patient"} liked your comment`,
              }));
              // }
            }
            await expo.sendPushNotificationsAsync(messages);
          }
          callback(res);
        },
      );
      socket.on(
        SupDocEvents.FETCH_POSTS,
        async (timestamp: number, callback) => {
          const userType = doctorExists ? UserType.DOCTOR : UserType.PATIENT;
          const user = doctorExists ?? patientExists;
          const res = await getPosts(userType, user as User, timestamp);
          if (res.status !== STATUS_CODES.SUCCESS || !res.posts)
            return callback(res);

          for (const post of res.posts)
            socket.join(post._id?.toString() as string);
          callback(res);
        },
      );
      socket.on(SupDocEvents.DISCONNECT, () => {
        if (socket.handshake.query.id) {
          usersConnected[socket.handshake.query.id as string] = usersConnected[
            socket.handshake.query.id as string
          ].filter((v) => v !== socket.id);
          if (usersConnected[socket.handshake.query.id as string].length == 0)
            delete usersConnected[socket.handshake.query.id as string];
        }
      });
    });

    refreshFacts();
    setInterval(() => refreshFacts(), 1000 * 3600 * 2);

    httpServer.listen(port);
    console.log("Server Started!");
    // app.listen(port, () => {
    //   console.log(`Server started at http://localhost:${port}`);
    // });
  })
  .catch((error: Error) => {
    console.error("Database connection failed", error);
    process.exit();
  });
