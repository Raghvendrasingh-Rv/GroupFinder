import { Router } from "express";
import { authMiddleware } from "../../common/middleware/auth.middleware.js";
import { acceptRequest, getPendingRequestsForEvent, rejectRequest, sendJoinRequest } from "./request.controller.js";

export const requestRouter = Router();

requestRouter.use(authMiddleware);
/**
 * @openapi
 * /events/{id}/request:
 *   post:
 *     summary: Send join request
 *     tags:
 *       - Requests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Join request sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SendJoinRequestResponse'
 */
requestRouter.post("/events/:id/request", sendJoinRequest);
/**
 * @openapi
 * /events/{eventId}/manage-requests:
 *   get:
 *     summary: Get pending requests for an event
 *     tags:
 *       - Requests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pending requests fetched successfully
 *       403:
 *         description: Forbidden
 */
requestRouter.get("/events/:eventId/manage-requests", getPendingRequestsForEvent);
/**
 * @openapi
 * /requests/{id}/accept:
 *   post:
 *     summary: Accept request
 *     tags:
 *       - Requests
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
 *         description: Request accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProcessRequestResponse'
 */
requestRouter.post("/requests/:id/accept", acceptRequest);
requestRouter.post("/:id/accept", acceptRequest);
/**
 * @openapi
 * /requests/{id}/reject:
 *   post:
 *     summary: Reject request
 *     tags:
 *       - Requests
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
 *         description: Request rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProcessRequestResponse'
 */
requestRouter.post("/requests/:id/reject", rejectRequest);
requestRouter.post("/:id/reject", rejectRequest);
