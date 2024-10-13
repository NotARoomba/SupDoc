import cors from "cors";
import { Expo } from "expo-server-sdk";
import express, { Request, Response } from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import SupDocEvents from "./models/events";
import { UserType } from "./models/util";
import { doctorsRouter } from "./routers/doctors.router";
import { factsRouter } from "./routers/facts.router";
import { imagesRouter } from "./routers/images.router";
import { patientsRouter } from "./routers/patients.router";
import { postsRouter } from "./routers/posts.router";
import { usersRouter } from "./routers/users.router";
import { verifyRouter } from "./routers/verify.router";
import { connectToDatabase, env } from "./services/database.service";
import { decryptionMiddleware } from "./services/encryption.service";
import { refreshFacts } from "./services/facts.service";

export const app = express();
const httpServer = createServer(app);
const port = 3001;

// const corsOptions: CorsOptions = {
//   // allowedHeaders: 'Authorization'
// };

const io = new Server(httpServer);

let expo = new Expo({
  accessToken: env.EXPO_ACCESS_TOKEN,
  useFcmV1: true,
});

export let usersConnected: {
  [key: string]: { sockets: string[]; userType: UserType };
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
    io.on(SupDocEvents.CONNECT, (socket: Socket) => {
      console.log(`New client connected: ${socket.id}`);
      // store the id of the socket with the public key of the user using socket.handshake.query.publicKey
      if (
        socket.handshake.query.publicKey &&
        socket.handshake.query.id &&
        socket.handshake.query.userType
      ) {
        if (!usersConnected[socket.handshake.query.id as string])
          usersConnected[socket.handshake.query.id as string] = {
            sockets: [],
            userType: socket.handshake.query.userType as UserType,
          };
        else
          usersConnected[socket.handshake.query.id as string].sockets.push(
            socket.id,
          );
        if (!usersConnected[socket.handshake.query.publicKey as string])
          usersConnected[socket.handshake.query.publicKey as string] = {
            sockets: [],
            userType: socket.handshake.query.userType as UserType,
          };
        else
          usersConnected[
            socket.handshake.query.publicKey as string
          ].sockets.push(socket.id);
      }
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
