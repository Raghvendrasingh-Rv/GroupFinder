import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const emptyStringToUndefined = (value: unknown) =>
  value === "" || value === null ? undefined : value;

const envSchema = z.object({
  // App
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  FRONTEND_URL: z.preprocess(emptyStringToUndefined, z.string().optional()),
  CORS_ORIGIN: z.preprocess(emptyStringToUndefined, z.string().optional()),

  // Auth
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().default("1d"),

  // Database
  DATABASE_URL: z.string().optional(),

  // OTP
  OTP_STORE: z.enum(["memory", "redis"]).default("memory"),

  // Redis
  REDIS_URL: z.preprocess(emptyStringToUndefined, z.string().optional()),
  REDIS_HOST: z.preprocess(emptyStringToUndefined, z.string().optional()),
  REDIS_PORT: z.preprocess(emptyStringToUndefined, z.coerce.number().int().positive().optional()),
  REDIS_USERNAME: z.preprocess(emptyStringToUndefined, z.string().optional()),
  REDIS_PASSWORD: z.preprocess(emptyStringToUndefined, z.string().optional()),

  // Email
  EMAIL_PROVIDER: z.enum(["resend", "gmail"]).default("resend"),
  RESEND_API_KEY: z.preprocess(emptyStringToUndefined, z.string().optional()),
  RESEND_FROM: z.preprocess(emptyStringToUndefined, z.string().optional()),
  GMAIL_USER: z.preprocess(emptyStringToUndefined, z.string().optional()),
  GMAIL_APP_PASSWORD: z.preprocess(emptyStringToUndefined, z.string().optional()),
  GMAIL_FROM: z.preprocess(emptyStringToUndefined, z.string().optional())
});

export const env = envSchema.parse(process.env);
