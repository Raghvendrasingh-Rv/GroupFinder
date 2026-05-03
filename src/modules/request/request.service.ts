import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../common/utils/AppError.js";
import { HTTP_STATUS } from "../../common/utils/constants.js";
import { assertEventOwner } from "../../common/utils/authorization.js";

class RequestService {
  async getPendingRequestsForEvent(eventId: string | undefined, actorId: string | undefined) {
    if (!eventId) {
      throw new AppError("Event ID is required", HTTP_STATUS.BAD_REQUEST);
    }

    if (!actorId) {
      throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        creatorId: true,
        title: true,
        category: true,
        createdAt: true
      }
    });

    assertEventOwner(event, actorId);

    const requests = await prisma.request.findMany({
      where: {
        eventId,
        status: "PENDING"
      },
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            mobileNumber: true,
            createdAt: true
          }
        }
      }
    });

    return {
      success: true,
      message: "Pending requests fetched successfully",
      data: {
        event,
        requests
      }
    };
  }

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

      await tx.event.update({
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

      const updatedEventWithParticipants = await tx.event.findUniqueOrThrow({
        where: { id: event.id },
        select: {
          id: true,
          creatorId: true,
          category: true,
          title: true,
          description: true,
          eventAddress: true,
          eventDate: true,
          eventTime: true,
          maxParticipants: true,
          currentParticipants: true,
          status: true,
          createdAt: true,
          creator: {
            select: {
              id: true,
              username: true,
              mobileNumber: true
            }
          },
          participants: {
            select: {
              userId: true
            }
          }
        }
      });

      return {
        success: true,
        message: "Request accepted successfully",
        data: {
          request: updatedRequest,
          event: updatedEventWithParticipants
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
