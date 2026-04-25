import type { Event } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../common/utils/AppError.js";
import { HTTP_STATUS } from "../../common/utils/constants.js";

export type CreateEventDTO = {
  creatorId: string;
  category?: string;
  title?: string;
  description?: string;
  eventAddress?: string;
  eventDate?: string;
  eventTime?: string;
  maxParticipants?: number;
};

export type EventFiltersDTO = {
  limit?: string | number;
  offset?: string | number;
  category?: string;
  timing?: string;
};

function normalizeString(value?: string) {
  return value?.trim();
}

function parseInteger(value: string | number | undefined, fallback: number) {
  if (value === undefined) return fallback;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

function parseDate(value?: string) {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeTime(value?: string) {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

class EventService {
  async createEvent(input: CreateEventDTO): Promise<Event> {
    const creatorId = normalizeString(input.creatorId);
    const category = normalizeString(input.category);
    const title = normalizeString(input.title);
    const description = normalizeString(input.description);
    const eventAddress = normalizeString(input.eventAddress);
    const eventDate = parseDate(input.eventDate);
    const eventTime = normalizeTime(input.eventTime);

    if (!creatorId || !category || !title || !description || !eventAddress || !eventDate || !eventTime) {
      throw new AppError("Required event fields are missing or invalid", HTTP_STATUS.BAD_REQUEST);
    }

    if (typeof input.maxParticipants !== "number" || !Number.isInteger(input.maxParticipants) || input.maxParticipants <= 0) {
      throw new AppError("maxParticipants must be a positive integer", HTTP_STATUS.BAD_REQUEST);
    }

    await prisma.user.findUniqueOrThrow({
      where: { id: creatorId }
    });

    return prisma.event.create({
      data: {
        creatorId,
        category,
        title,
        description,
        eventAddress,
        eventDate,
        eventTime,
        maxParticipants: input.maxParticipants
      }
    });
  }

  async getEvents(filters: EventFiltersDTO) {
    const limit = parseInteger(filters.limit, 10);
    const offset = parseInteger(filters.offset, 0);
    const category = normalizeString(filters.category);
    const timing = normalizeString(filters.timing)?.toLowerCase();

    if (timing && !["today", "upcoming"].includes(timing)) {
      throw new AppError("Timing must be either today or upcoming", HTTP_STATUS.BAD_REQUEST);
    }

    const where: Record<string, unknown> = {};

    if (category) {
      where.category = category;
    }

    if (timing) {
      const today = new Date();
      const startOfToday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
      const startOfTomorrow = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1));

      where.eventDate =
        timing === "today"
          ? {
              gte: startOfToday,
              lt: startOfTomorrow
            }
          : {
              gte: startOfTomorrow
            };
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
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
          }
        }
      }),
      prisma.event.count({
        where
      })
    ]);

    return {
      success: true,
      data: events,
      meta: {
        total,
        limit,
        offset,
        locationFilter: null,
        category: category ?? null,
        timing: timing ?? null
      }
    };
  }

  async getEventById(id?: string) {
    if (!id) {
      throw new AppError("Event ID is required", HTTP_STATUS.BAD_REQUEST);
    }

    const event = await prisma.event.findUnique({
      where: { id },
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
        }
      }
    });

    if (!event) {
      throw new AppError("Event not found", HTTP_STATUS.NOT_FOUND);
    }

    return {
      success: true,
      data: event
    };
  }

  async getEventsWithLocationFilter(filters: EventFiltersDTO) {
    return this.getEvents(filters);
  }
}

export const eventService = new EventService();
