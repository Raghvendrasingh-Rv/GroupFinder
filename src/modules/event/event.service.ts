import type { Event } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../common/utils/AppError.js";
import { HTTP_STATUS } from "../../common/utils/constants.js";

export type CreateEventDTO = {
  creatorId: string;
  category?: string;
  title?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  eventDate?: string;
  eventTime?: string;
  maxParticipants?: number;
};

export type EventFiltersDTO = {
  limit?: string | number;
  offset?: string | number;
  latitude?: string | number;
  longitude?: string | number;
  radius?: string | number;
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

function isValidNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value);
}

function toNumber(value: string | number | undefined) {
  if (value === undefined) {
    return null;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function getDistanceKm(
  fromLatitude: number,
  fromLongitude: number,
  toLatitude: number,
  toLongitude: number
) {
  const earthRadiusKm = 6371;
  const deltaLatitude = toRadians(toLatitude - fromLatitude);
  const deltaLongitude = toRadians(toLongitude - fromLongitude);

  const a =
    Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) +
    Math.cos(toRadians(fromLatitude)) *
      Math.cos(toRadians(toLatitude)) *
      Math.sin(deltaLongitude / 2) *
      Math.sin(deltaLongitude / 2);

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

class EventService {
  async createEvent(input: CreateEventDTO): Promise<Event> {
    const creatorId = normalizeString(input.creatorId);
    const category = normalizeString(input.category);
    const title = normalizeString(input.title);
    const description = normalizeString(input.description);
    const eventDate = parseDate(input.eventDate);
    const eventTime = normalizeTime(input.eventTime);

    if (!creatorId || !category || !title || !description || !eventDate || !eventTime) {
      throw new AppError("Required event fields are missing or invalid", HTTP_STATUS.BAD_REQUEST);
    }

    if (!isValidNumber(input.latitude) || !isValidNumber(input.longitude) || !isValidNumber(input.maxParticipants)) {
      throw new AppError("Latitude, longitude, and maxParticipants are required", HTTP_STATUS.BAD_REQUEST);
    }

    const latitude = input.latitude as number;
    const longitude = input.longitude as number;
    const maxParticipants = input.maxParticipants as number;

    await prisma.user.findUniqueOrThrow({
      where: { id: creatorId }
    });

    return prisma.event.create({
      data: {
        creatorId,
        category,
        title,
        description,
        latitude,
        longitude,
        eventDate,
        eventTime,
        maxParticipants
      }
    });
  }

  async getEvents(filters: EventFiltersDTO) {
    const limit = parseInteger(filters.limit, 10);
    const offset = parseInteger(filters.offset, 0);
    const queryLatitude = toNumber(filters.latitude);
    const queryLongitude = toNumber(filters.longitude);
    const queryRadius = toNumber(filters.radius);

    const hasLocationFilter =
      queryLatitude !== null && queryLongitude !== null && queryRadius !== null && queryRadius >= 0;

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        select: {
          id: true,
          creatorId: true,
          category: true,
          title: true,
          description: true,
          latitude: true,
          longitude: true,
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
      prisma.event.count()
    ]);

    const filteredEvents = hasLocationFilter
      ? events.filter((event) => {
          const distance = getDistanceKm(queryLatitude, queryLongitude, event.latitude, event.longitude);
          return distance <= queryRadius;
        })
      : events;

    return {
      success: true,
      data: filteredEvents,
      meta: {
        total,
        limit,
        offset,
        locationFilter: hasLocationFilter
          ? {
              latitude: queryLatitude,
              longitude: queryLongitude,
              radius: queryRadius
            }
          : null
      },
      note: hasLocationFilter
        ? "Location filtering is applied in application code using a simple Haversine distance check."
      : undefined
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
        latitude: true,
        longitude: true,
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

  async getEventsByCategory(category?: string) {
    const normalizedCategory = normalizeString(category);

    if (!normalizedCategory) {
      throw new AppError("Category is required", HTTP_STATUS.BAD_REQUEST);
    }

    const events = await prisma.event.findMany({
      where: {
        category: normalizedCategory
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        creatorId: true,
        category: true,
        title: true,
        description: true,
        latitude: true,
        longitude: true,
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

    return {
      success: true,
      data: events
    };
  }

  async getEventsByTiming(timing?: string) {
    const normalizedTiming = normalizeString(timing)?.toLowerCase();

    if (!normalizedTiming || !["today", "upcoming"].includes(normalizedTiming)) {
      throw new AppError("Timing must be either today or upcoming", HTTP_STATUS.BAD_REQUEST);
    }

    const today = new Date();
    const startOfToday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    const startOfTomorrow = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1));

    const where =
      normalizedTiming === "today"
        ? {
            eventDate: {
              gte: startOfToday,
              lt: startOfTomorrow
            }
          }
        : {
            eventDate: {
              gte: startOfTomorrow
            }
          };

    const events = await prisma.event.findMany({
      where,
      orderBy: { eventDate: "asc" },
      select: {
        id: true,
        creatorId: true,
        category: true,
        title: true,
        description: true,
        latitude: true,
        longitude: true,
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

    return {
      success: true,
      data: events,
      meta: {
        timing: normalizedTiming
      }
    };
  }

  /**
   * This helper is intentionally kept in application code for now.
   * For large datasets, move geospatial filtering into PostGIS for better index usage and performance.
   */
  async getEventsWithLocationFilter(filters: EventFiltersDTO) {
    return this.getEvents(filters);
  }
}

export const eventService = new EventService();
