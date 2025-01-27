import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../prisma/PrismaClient";
import jwt from "jsonwebtoken";

export const handleSignUp = async (req: Request, res: Response) => {
  const { username, password, email } = await req.body;
  if (!username || !password || !email) {
    res.status(400).json({ error: "Invalid Field" });
    return;
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email,
      },
    });
    const { password, ...responseData } = user;
    // all checks passed
    // sign token
    const token = jwt.sign(
      {
        id: responseData.id,
        email: responseData.email,
        username: responseData.username,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "30d" }
    );

    res.status(201).json({ responseData, token });
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const handleLogin = async (req: Request, res: Response) => {
  const { username, password, email } = req.body;

  if (!password || (!email && !username)) {
    res.status(400).json({ error: "Invalid Field" });
    return;
  }

  try {
    // login using email if email was provided
    if (email) {
      // check for user using email
      const existingUser = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });

      // if user do not exist
      // return error message
      if (!existingUser) {
        res.status(400).json({ error: "Authentication failed" });
        return;
      }

      // user exist
      // Compare the provided password
      const isPasswordValid = await bcrypt.compare(
        password,
        existingUser.password
      );

      // if password is wrong
      // return error
      if (!isPasswordValid) {
        res.status(400).json({ error: "Authentication failed" });
        return;
      }

      // all checks passed
      // sign token
      const token = jwt.sign(
        { id: existingUser.id, email },
        process.env.JWT_SECRET as string,
        { expiresIn: "30d" }
      );
      res.status(200).json({ message: "Login Successful", email, token });
    } else {
      // login using username if username was provided
      // check for user using username
      const existingUsername = await prisma.user.findMany({
        where: {
          username: username,
        },
      });
      // if username does not exist
      // return error message
      if (existingUsername.length === 0) {
        res.status(400).json({ error: "Authentication failed" });
        return;
      }

      let isPasswordValid = false;
      // Variable to store the valid user's id
      let userId = null;

      // username exist
      // Loop through the username to validate the password
      for (const user of existingUsername) {
        // Compare the provided password
        const isValid = await bcrypt.compare(password, user.password);
        if (isValid) {
          isPasswordValid = true;
          userId = user.id;
          // user's password matched
          // break off the loop
          break;
        }
      }
      // if password is wrong
      // return error
      if (!isPasswordValid) {
        res.status(400).json({ error: "Authentication failed" });
        return;
      }

      // all checks passed
      // sign token
      const token = jwt.sign(
        { id: userId, email, username },
        process.env.JWT_SECRET as string,
        { expiresIn: "30d" }
      );
      res
        .status(200)
        .json({ message: "Login Successful", userId, username, token });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtNmRrN3JqazAwMDJ0dmlzNzkxbGowM2wiLCJlbWFpbCI6ImFsZXhhbmRlci5lbW15eGlhbm9AZ21haWwuY29tIiwiaWF0IjoxNzM3ODkyMzU1LCJleHAiOjE3NDA0ODQzNTV9.6AFErZQaZQBqplzWBQoPlsmjlNBXPNiuUCLj_tkP1wA
