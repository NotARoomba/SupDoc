import express, { Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import { connectToDatabase } from "./services/database.service";
import encryptionMiddleware from "./services/encryption.service";
import { verifyRouter } from "./routers/verify.router";
import { patientsRouter } from "./routers/patients.router";
import { Server, Socket } from "socket.io";
import { createServer } from "http";
import { postsRouter } from "./routers/posts.router";
import { doctorsRouter } from "./routers/doctors.router";
import { usersRouter } from "./routers/users.router";

const app = express();
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
    app.use("/verify", verifyRouter);

    app.use("/", async (_req: Request, res: Response) => {
      res.status(200).send("You arent supposed to be here");
    });

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
