import express, { json, urlencoded } from "express";
import dotenv from "dotenv";
import taskRoutes from "./routes/taskRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";

import { authMiddleware } from "./middleware/authMiddleware.js";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
});

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;
app.use(limiter);
app.use(urlencoded({ extended: false }));
app.use(json({ limit: "70kb" }));
// Apply the rate limiting middleware to all requests.
app.use(helmet());
app.use(cors());

// app.use(middleware)

app.get("/", (req, res) => {
  res.send("Home Page");
});

// route for authentication
app.use("/auth", authRoutes);

// route for getting tasks
app.use("/task", authMiddleware, taskRoutes);
app.all("*", (req, res) => {
  res.status(404).send("Wallahi, Resource does not Exist");
});

const start = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server is Listening on PORT ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();

// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();

// async function main() {
//   const users = await prisma.user.findMany();
//   console.log(users);
// }

// main()
//   .catch((e) => {
//     console.error(e);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
