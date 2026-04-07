import type { NextFunction, Request, Response } from "express";
import { userService } from "./user.service.js";

export async function getCurrentUser(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await userService.getUserById(req.user?.sub);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function updateCurrentUser(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await userService.updateProfile(req.user?.sub, req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
