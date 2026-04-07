import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { userService } from "../user/user.service.js";
import { AppError } from "../../common/utils/AppError.js";
import { HTTP_STATUS } from "../../common/utils/constants.js";
import { createOtp, hashEquals, hashOtp, normalizeOtpKey } from "./auth.util.js";
import { MemoryOtpStore } from "./memoryOtp.store.js";
import { createRedisOtpStore } from "./redisOtp.store.js";
import { sendOtpEmail } from "../../config/mail.js";
import type { OtpRecord, OtpStore } from "./otp.store.js";

type SendOtpInput = {
  email?: string;
};

type VerifyOtpInput = {
  email?: string;
  otp?: string;
};

const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function createOtpStore(): OtpStore {
  if (env.OTP_STORE === "redis") {
    return createRedisOtpStore();
  }

  return new MemoryOtpStore();
}

const otpStore = createOtpStore();

class AuthService {
  async sendOtp(input: SendOtpInput) {
    const email = normalizeOtpKey(input.email);

    if (!email) {
      throw new AppError("Email is required", HTTP_STATUS.BAD_REQUEST);
    }

    const otp = createOtp();
    const record: OtpRecord = {
      hash: hashOtp(otp),
      expiresAt: Date.now() + OTP_TTL_MS,
      attempts: 0
    };

    await otpStore.set(email, record, OTP_TTL_MS);
    await sendOtpEmail(email, otp);

    return {
      success: true,
      message: "OTP sent successfully",
      data: {
        email,
        expiresInSeconds: OTP_TTL_MS / 1000
      }
    };
  }

  async verifyOtp(input: VerifyOtpInput) {
    const email = normalizeOtpKey(input.email);
    const otp = input.otp?.trim();

    if (!email || !otp) {
      throw new AppError("Email and OTP are required", HTTP_STATUS.BAD_REQUEST);
    }

    const record = await otpStore.get(email);
    if (!record) {
      throw new AppError("OTP not found or expired", HTTP_STATUS.BAD_REQUEST);
    }

    if (Date.now() > record.expiresAt) {
      await otpStore.delete(email);
      throw new AppError("OTP expired", HTTP_STATUS.BAD_REQUEST);
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      await otpStore.delete(email);
      throw new AppError("Too many invalid attempts", HTTP_STATUS.UNPROCESSABLE_ENTITY);
    }

    const isValid = hashEquals(record.hash, hashOtp(otp));

    if (!isValid) {
      const attempts = await otpStore.incrementAttempts(email);
      if (attempts >= MAX_ATTEMPTS) {
        await otpStore.delete(email);
        throw new AppError("Too many invalid attempts", HTTP_STATUS.UNPROCESSABLE_ENTITY);
      }

      throw new AppError("Invalid OTP", HTTP_STATUS.UNAUTHORIZED);
    }

    await otpStore.delete(email);

    let user;
    try {
      user = await userService.createUserIfNotExists({
        email,
        username: email.split("@")[0]
      });
    } catch (error) {
      console.error("[verifyOtp] Failed to create or fetch user", {
        email,
        error
      });
      throw new AppError("Failed to create or fetch user during OTP verification", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    let token: string;
    try {
      token = jwt.sign(
        {
          sub: user.id,
          email,
          mobileNumber: user.mobileNumber ?? undefined,
          purpose: "auth"
        },
        env.JWT_SECRET,
        {
          expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]
        }
      );
    } catch (error) {
      console.error("[verifyOtp] Failed to sign JWT", {
        userId: user.id,
        email,
        error
      }
      );
      throw new AppError("Failed to create authentication token", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    return {
      success: true,
      message: "OTP verified successfully",
      data: {
        token,
        tokenType: "Bearer",
        userId: user.id
      }
    };
  }
}

export const authService = new AuthService();
