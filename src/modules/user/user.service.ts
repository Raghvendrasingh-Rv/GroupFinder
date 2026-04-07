import type { User } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../common/utils/AppError.js";
import { HTTP_STATUS } from "../../common/utils/constants.js";

type CreateUserInput = {
  email?: string;
  username?: string;
  mobileNumber?: string;
  latitude?: number;
  longitude?: number;
};

type UpdateProfileInput = {
  username?: string;
  latitude?: number;
  longitude?: number;
};

function normalizeEmail(email?: string) {
  return email?.trim().toLowerCase();
}

function normalizeMobileNumber(mobileNumber?: string) {
  return mobileNumber?.trim() || undefined;
}

function isValidNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value);
}

class UserService {
  async createUserIfNotExists(input: CreateUserInput): Promise<User> {
    const email = normalizeEmail(input.email);

    if (!email) {
      throw new AppError("Email is required", HTTP_STATUS.BAD_REQUEST);
    }

    const existingUser = await prisma.user.findFirst({
      where: { email }
    });

    if (existingUser) {
      return existingUser;
    }

    return prisma.user.create({
      data: {
        email,
        username: input.username?.trim() ?? "",
        mobileNumber: normalizeMobileNumber(input.mobileNumber),
        latitude: input.latitude,
        longitude: input.longitude
      }
    });
  }

  async getUserById(id?: string): Promise<User> {
    if (!id) {
      throw new AppError("User ID is required", HTTP_STATUS.BAD_REQUEST);
    }

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
    }

    return user;
  }

  async updateProfile(id: string | undefined, input: UpdateProfileInput): Promise<User> {
    if (!id) {
      throw new AppError("User ID is required", HTTP_STATUS.BAD_REQUEST);
    }

    const username = input.username?.trim();
    const latitude = input.latitude;
    const longitude = input.longitude;

    if (!username && !isValidNumber(latitude) && !isValidNumber(longitude)) {
      throw new AppError("At least one field is required", HTTP_STATUS.BAD_REQUEST);
    }

    await this.getUserById(id);

    return prisma.user.update({
      where: { id },
      data: {
        ...(username ? { username } : {}),
        ...(isValidNumber(latitude) ? { latitude } : {}),
        ...(isValidNumber(longitude) ? { longitude } : {})
      }
    });
  }
}

export const userService = new UserService();
