import { Router } from "express";
import { authMiddleware } from "../../common/middleware/auth.middleware.js";
import { validate } from "../../common/middleware/validation.middleware.js";
import { createEvent, getEventById, getEvents } from "./event.controller.js";
import { z } from "zod";

export const eventRouter = Router();

eventRouter.use(authMiddleware);

const createEventSchema = z.object({
  category: z.string().min(1, "Category is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  eventAddress: z.string().min(1, "eventAddress is required"),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "eventDate must be in YYYY-MM-DD format"),
  eventTime: z.string().min(1, "eventTime is required"),
  maxParticipants: z.coerce.number().int().positive("maxParticipants must be a positive integer")
});

/**
 * 
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
 *     summary: Get events
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: timing
 *         required: false
 *         schema:
 *           type: string
 *           enum: [today, upcoming]
 *     responses:
 *       200:
 *         description: List of events
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventListResponse'
 *       400:
 *         description: At least one filter is required
 */
eventRouter.get("/", getEvents);
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
