import type { NextFunction, Request, RequestHandler, Response } from "express";
import { AppError } from "../utils/AppError.js";
import { HTTP_STATUS } from "../utils/constants.js";

type ValidationSchema = {
  safeParse: (value: unknown) => {
    success: boolean;
    data?: unknown;
    error?: { issues: Array<{ message: string }> };
  };
};

export function validate(schema: ValidationSchema, target: "body" | "query" | "params" = "body"): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const message = result.error?.issues[0]?.message ?? "Validation failed";
      return next(new AppError(message, HTTP_STATUS.BAD_REQUEST));
    }

    req[target] = result.data as typeof req[typeof target];
    return next();
  };
}
