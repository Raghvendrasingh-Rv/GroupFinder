import { Router } from "express";
import { sendOtp, verifyOtp } from "./auth.controller.js";
import { validate } from "../../common/middleware/validation.middleware.js";
import { z } from "zod";

export const authRouter = Router();

const sendOtpSchema = z.object({
  email: z.string().email("Valid email is required")
});

const verifyOtpSchema = z.object({
  email: z.string().email("Valid email is required"),
  otp: z.string().length(6, "OTP must be 6 digits")
});

/**
 * @openapi
 * /auth/send-otp:
 *   post:
 *     summary: Send OTP
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendOtpRequest'
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SendOtpResponse'
 */
authRouter.post("/send-otp", validate(sendOtpSchema), sendOtp);

/**
 * @openapi
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP and issue JWT
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyOtpRequest'
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VerifyOtpResponse'
 */
authRouter.post("/verify-otp", validate(verifyOtpSchema), verifyOtp);
