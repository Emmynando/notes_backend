import express, { json, urlencoded } from "express";
import dotenv from "dotenv";
import taskRoutes from "./routes/taskRoutes";
import authRoutes from "./routes/authRoutes";
import { authMiddleware } from "./middleware/authMiddleware";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;
app.use(urlencoded({ extended: false }));
app.use(json());

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
