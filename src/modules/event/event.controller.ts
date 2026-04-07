import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../common/utils/AppError.js";
import { HTTP_STATUS } from "../../common/utils/constants.js";
import { eventService } from "./event.service.js";

export async function createEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const creatorId = req.user?.sub;
    if (!creatorId) {
      throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }

    const result = await eventService.createEvent({
      ...req.body,
      creatorId
    });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getEvents(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await eventService.getEvents(req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getEventById(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await eventService.getEventById(req.params.id as string | undefined);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getEventsByCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await eventService.getEventsByCategory(req.params.category as string | undefined);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getEventsByTiming(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await eventService.getEventsByTiming(req.params.timing as string | undefined);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
