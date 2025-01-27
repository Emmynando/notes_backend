import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ message: "Unauthorized: No token provided" });
      return;
    }
    // Extract the token from headers
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    // Attach user info to the request object
    // Destructure iat and exp
    const { iat, exp, ...rest } = decoded as any;
    (req as any).user = rest;

    // Pass control to the next middleware or route
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
}
