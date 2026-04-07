import type { Event } from "@prisma/client";
import { AppError } from "./AppError.js";
import { HTTP_STATUS } from "./constants.js";

export function assertEventOwner(
  event: Pick<Event, "creatorId"> | null | undefined,
  actorId: string | undefined
): asserts event is Pick<Event, "creatorId"> {
  if (!actorId) {
    throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
  }

  if (!event) {
    throw new AppError("Event not found", HTTP_STATUS.NOT_FOUND);
  }

  if (event.creatorId !== actorId) {
    throw new AppError("Forbidden", HTTP_STATUS.FORBIDDEN);
  }
}
