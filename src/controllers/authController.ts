import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../prisma/PrismaClient.js";
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
    // const token = jwt.sign(
    //   {
    //     id: responseData.id,
    //     email: responseData.email,
    //     username: responseData.username,
    //   },
    //   process.env.JWT_SECRET as string,
    //   { expiresIn: "30d" }
    // );

    // Generate Access Token
    const accessToken = jwt.sign(
      {
        id: responseData.id,
        email: responseData.email,
        username: responseData.username,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" } // Short lifespan for access token
    );

    // Generate Refresh Token
    const refreshToken = jwt.sign(
      { id: responseData.id },
      process.env.REFRESH_SECRET as string,
      { expiresIn: "7d" } // Longer lifespan for refresh token
    );

    // Set refresh token in HTTP-Only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true, // Set to false in development
      sameSite: "strict",
    });

    res.status(201).json({ responseData, accessToken });
  } catch (error) {
    res.status(500).json({ error });
  }
};

// HANDLE LOGIN
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

      // console.log(existingUser)

      // all checks passed
      // sign token

      // Generate Access Token
      const accessToken = jwt.sign(
        { id: existingUser.id, email: existingUser.email },
        process.env.JWT_SECRET as string,
        { expiresIn: "15m" }
      );

      // Generate Refresh Token
      const refreshToken = jwt.sign(
        { id: existingUser.id },
        process.env.REFRESH_SECRET as string,
        { expiresIn: "7d" }
      );

      // Store refresh token in HTTP-Only Cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true, // Set to false in development
        sameSite: "strict",
      });

      res.status(200).json({ message: "Login Successful", email, accessToken });
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
      // const token = jwt.sign(
      //   { id: userId, email, username },
      //   process.env.JWT_SECRET as string,
      //   { expiresIn: "30d" }
      // );
      const accessToken = jwt.sign(
        { id: userId, email, username },
        process.env.JWT_SECRET as string,
        { expiresIn: "15m" }
      );

      // Generate Refresh Token
      const refreshToken = jwt.sign(
        { id: userId },
        process.env.REFRESH_SECRET as string,
        { expiresIn: "7d" }
      );

      // Store refresh token in HTTP-Only Cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true, // Set to false in development
        sameSite: "strict",
      });
      res.status(200).json({ message: "Login Successful", email, accessToken });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const handleRefreshToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(403).json({ error: "Refresh token required" });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_SECRET as string
    ) as { id: string };

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return res.status(403).json({ error: "User not found" });
    }

    // Generate new Access Token
    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" }
    );

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ error: "Invalid refresh token" });
  }
};
