import { Router } from "express";
import { authMiddleware } from "../../common/middleware/auth.middleware.js";
import { validate } from "../../common/middleware/validation.middleware.js";
import { createEvent, getEventById, getEvents, getEventsByCategory, getEventsByTiming } from "./event.controller.js";
import { z } from "zod";

export const eventRouter = Router();

eventRouter.use(authMiddleware);

const createEventSchema = z.object({
  category: z.string().min(1, "Category is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  latitude: z.coerce.number().finite("Latitude must be a valid number"),
  longitude: z.coerce.number().finite("Longitude must be a valid number"),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "eventDate must be in YYYY-MM-DD format"),
  eventTime: z.string().min(1, "eventTime is required"),
  maxParticipants: z.coerce.number().int().positive("maxParticipants must be a positive integer")
});
/**
 * @openapi
 * /events:
 *   post:
 *     summary: Create event
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEventRequest'
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateEventResponse'
 */
eventRouter.post("/", validate(createEventSchema), createEvent);
/**
 * @openapi
 * /events:
 *   get:
 *     summary: Get all events
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of events
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventListResponse'
 */
eventRouter.get("/", getEvents);
/**
 * @openapi
 * /events/category/{category}:
 *   get:
 *     summary: Get events by category
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of events for a category
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventByCategoryResponse'
 */
eventRouter.get("/category/:category", getEventsByCategory);
/**
 * @openapi
 * /events/timing/{timing}:
 *   get:
 *     summary: Get events by timing
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: timing
 *         required: true
 *         schema:
 *           type: string
 *           enum: [today, upcoming]
 *     responses:
 *       200:
 *         description: Events for the selected timing bucket
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventByTimingResponse'
 */
eventRouter.get("/timing/:timing", getEventsByTiming);
/**
 * @openapi
 * /events/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventResponse'
 */
eventRouter.get("/:id", getEventById);
