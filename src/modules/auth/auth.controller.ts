import type { NextFunction, Request, Response } from "express";
import { authService } from "./auth.service.js";

export async function sendOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.sendOtp(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function verifyOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.verifyOtp(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
