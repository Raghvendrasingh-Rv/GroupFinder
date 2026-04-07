import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../common/utils/AppError.js";
import { HTTP_STATUS } from "../../common/utils/constants.js";
import { assertEventOwner } from "../../common/utils/authorization.js";

class RequestService {
  async sendJoinRequest(eventId: string | undefined, userId: string | undefined) {
    if (!eventId) {
      throw new AppError("Event ID is required", HTTP_STATUS.BAD_REQUEST);
    }

    if (!userId) {
      throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }

    await prisma.event.findUniqueOrThrow({
      where: { id: eventId }
      ,
      select: { id: true }
    });

    try {
      const request = await prisma.request.create({
        data: {
          eventId,
          userId
        }
      });

      return {
        success: true,
        message: "Join request sent successfully",
        data: request
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new AppError("Duplicate request not allowed", HTTP_STATUS.CONFLICT);
      }

      throw error;
    }
  }

  async acceptRequest(requestId: string | undefined, actorId: string | undefined) {
    if (!requestId) {
      throw new AppError("Request ID is required", HTTP_STATUS.BAD_REQUEST);
    }

    if (!actorId) {
      throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }

    return prisma.$transaction(async (tx) => {
      const request = await tx.request.findUnique({
        where: { id: requestId }
        ,
        select: {
          id: true,
          eventId: true,
          userId: true,
          status: true,
          event: {
            select: {
              id: true,
              creatorId: true,
              currentParticipants: true,
              maxParticipants: true
            }
          }
        }
      });

      if (!request) {
        throw new AppError("Request not found", HTTP_STATUS.NOT_FOUND);
      }

      if (request.status !== "PENDING") {
        throw new AppError("Request has already been processed", HTTP_STATUS.CONFLICT);
      }

      const event = request.event;

      assertEventOwner(event, actorId);

      if (event.currentParticipants >= event.maxParticipants) {
        throw new AppError("Event capacity reached", HTTP_STATUS.BAD_REQUEST);
      }

      const updatedRequest = await tx.request.update({
        where: { id: requestId },
        data: { status: "ACCEPTED" }
      });

      const updatedEvent = await tx.event.update({
        where: { id: event.id },
        data: {
          currentParticipants: {
            increment: 1
          }
        }
      });

      await tx.participant.create({
        data: {
          eventId: event.id,
          userId: request.userId
        }
      });

      return {
        success: true,
        message: "Request accepted successfully",
        data: {
          request: updatedRequest,
          event: updatedEvent
        }
      };
    });
  }

  async rejectRequest(requestId: string | undefined, actorId: string | undefined) {
    if (!requestId) {
      throw new AppError("Request ID is required", HTTP_STATUS.BAD_REQUEST);
    }

    if (!actorId) {
      throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }

    return prisma.$transaction(async (tx) => {
      const request = await tx.request.findUnique({
        where: { id: requestId }
        ,
        select: {
          id: true,
          eventId: true,
          userId: true,
          status: true,
          event: {
            select: {
              id: true,
              creatorId: true
            }
          }
        }
      });

      if (!request) {
        throw new AppError("Request not found", HTTP_STATUS.NOT_FOUND);
      }

      if (request.status !== "PENDING") {
        throw new AppError("Request has already been processed", HTTP_STATUS.CONFLICT);
      }

      assertEventOwner(request.event, actorId);

      const updatedRequest = await tx.request.update({
        where: { id: requestId },
        data: { status: "REJECTED" }
      });

      return {
        success: true,
        message: "Request rejected successfully",
        data: updatedRequest
      };
    });
  }
}

export const requestService = new RequestService();
