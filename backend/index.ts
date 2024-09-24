import cors from "cors";
import express, { Request, Response } from "express";
import { createServer } from "http";
import { doctorsRouter } from "./routers/doctors.router";
import { factsRouter } from "./routers/facts.router";
import { patientsRouter } from "./routers/patients.router";
import { postsRouter } from "./routers/posts.router";
import { usersRouter } from "./routers/users.router";
import { verifyRouter } from "./routers/verify.router";
import { connectToDatabase } from "./services/database.service";
import { decryptionMiddleware } from "./services/encryption.service";
import { imagesRouter } from "./routers/images.router";

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
