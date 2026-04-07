import { Router } from "express";
import { authMiddleware } from "../../common/middleware/auth.middleware.js";
import { getCurrentUser, updateCurrentUser } from "./user.controller.js";

export const userRouter = Router();

userRouter.use(authMiddleware);
/**
 * @openapi
 * /users/me:
 *   get:
 *     summary: Get current user profile
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CurrentUserResponse'
 */
userRouter.get("/me", getCurrentUser);
/**
 * @openapi
 * /users/me:
 *   put:
 *     summary: Update current user profile
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateUserResponse'
 */
userRouter.put("/me", updateCurrentUser);
