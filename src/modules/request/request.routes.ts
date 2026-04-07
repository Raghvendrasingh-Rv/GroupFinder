import { Router } from "express";
import { authMiddleware } from "../../common/middleware/auth.middleware.js";
import { acceptRequest, rejectRequest, sendJoinRequest } from "./request.controller.js";

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
requestRouter.post("/:id/reject", rejectRequest);
