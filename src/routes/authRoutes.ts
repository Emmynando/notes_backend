import express from "express";
import {
  handleSignUp,
  handleLogin,
  handleRefreshToken,
} from "../controllers/authController.js";
import { zodValidateData } from "../middleware/zodMiddleware.js";
import { z } from "zod";
const router = express.Router();

const createUser = z.object({
  // id: z.string(),
  email: z.string().email(),
  username: z.string().min(2, { message: "Must be 3 or more characters" }),
  password: z.string().min(3, { message: "Must be 3 or more characters" }),
});

const loginValidation = z
  .object({
    password: z
      .string()
      .min(3, { message: "Password must be at least 3 characters" }),
  })
  .and(
    z.union([
      z.object({ email: z.string().email() }),
      z.object({
        username: z
          .string()
          .min(2, { message: "Username must be at least 2 characters" }),
      }),
    ])
  );

// sign up
router.post("/register", zodValidateData(createUser), handleSignUp);

// login
router.post("/login", zodValidateData(loginValidation), handleLogin);

// refresh token
router.post("/refresh-token", handleRefreshToken);

// clear token
router.post("/logout", handleRefreshToken);

export default router;
