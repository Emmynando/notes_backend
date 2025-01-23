import { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";

export function zodValidateData(schema: z.ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((issue: any) => ({
          message: `${issue.path.join(".")}: is ${issue.message}`,
        }));
        res.status(400).json({ error: "invalid data", details: errorMessages });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  };
}
