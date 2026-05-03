import type { NextFunction, Request, Response } from "express";
import { requestService } from "./request.service.js";

export async function sendJoinRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await requestService.sendJoinRequest(req.params.id as string | undefined, req.user?.sub);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getPendingRequestsForEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await requestService.getPendingRequestsForEvent(
      req.params.eventId as string | undefined,
      req.user?.sub
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function acceptRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await requestService.acceptRequest(req.params.id as string | undefined, req.user?.sub);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function rejectRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await requestService.rejectRequest(req.params.id as string | undefined, req.user?.sub);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
