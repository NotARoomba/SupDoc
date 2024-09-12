import express, { Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import { connectToDatabase, env } from "./services/database.service";
import encryptionMiddleware from "./services/encryption.service";
import { verifyRouter } from "./routers/verify.router";
import { patientsRouter } from "./routers/patients.router";
import { Server, Socket } from "socket.io";
import { createServer } from "http";
import { postsRouter } from "./routers/posts.router";
import { doctorsRouter } from "./routers/doctors.router";
import { usersRouter } from "./routers/users.router";
import { factsRouter } from "./routers/facts.router";
import NodeRSA from "node-rsa";

export const app = express();
const httpServer = createServer(app);
const port = 3001;

// const corsOptions: CorsOptions = {
//   // allowedHeaders: 'Authorization'
// };

// const io = new Server(httpServer, {cors: corsOptions});

connectToDatabase()
  .then(() => {
    app.use(cors());
    app.use(express.json({ limit: "50mb" }));
    app.use(encryptionMiddleware);
    app.use("/users", usersRouter);
    app.use("/patients", patientsRouter);
    app.use("/doctors", doctorsRouter);
    app.use("/posts", postsRouter);
    app.use("/facts", factsRouter);
    app.use("/verify", verifyRouter);

    app.use("/", async (_req: Request, res: Response) => {
      res.status(200).send("You arent supposed to be here");
    });
    
app.response.send = function (body: any) {
  const key = CryptoJS.SHA256(body).toString();
  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(body),
    key,
  ).toString();
  // need to check fot the public key of the user
  // res.send = oldSend;
  console.log("SEND")
  console.log(this.req.headers.authorization)
  return express.response.send({
    key:
      this.req.headers.authorization == env.LIMITED_AUTH
        ? key
        : (new NodeRSA(this.req.headers.authorization as string, "pkcs8-public", {
            encryptionScheme: "pkcs1",
            environment: "browser",
          }))
            .encrypt(key)
            .toString(),
    body: encrypted,
  });
};
    app.listen(port);
    console.log("Server started!");
    // app.listen(port, () => {
    //   console.log(`Server started at http://localhost:${port}`);
    // });
  })
  .catch((error: Error) => {
    console.error("Database connection failed", error);
    process.exit();
  });
