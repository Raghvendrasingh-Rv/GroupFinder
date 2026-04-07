import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { env } from "../../config/env.js";
import { AppError } from "../utils/AppError.js";
import { HTTP_STATUS } from "../utils/constants.js";

export type AuthenticatedUser = JwtPayload & {
  sub?: string;
  email?: string;
  mobileNumber?: string;
  purpose?: string;
};

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return next(new AppError("Authorization token missing", HTTP_STATUS.UNAUTHORIZED));
  }

  const token = header.slice(7).trim();

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    return next();
  } catch {
    return next(new AppError("Invalid or expired token", HTTP_STATUS.UNAUTHORIZED));
  }
}
