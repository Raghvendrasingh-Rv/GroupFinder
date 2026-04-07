import { createClient } from "redis";
import { env } from "./env.js";
import { AppError } from "../common/utils/AppError.js";
import { HTTP_STATUS } from "../common/utils/constants.js";

function getRedisOptions() {
  if (env.REDIS_URL) {
    return {
      url: env.REDIS_URL
    };
  }

  if (!env.REDIS_HOST || !env.REDIS_PORT) {
    throw new AppError("REDIS_HOST and REDIS_PORT are required when REDIS_URL is not provided", HTTP_STATUS.BAD_REQUEST);
  }

  return {
    username: env.REDIS_USERNAME ?? "default",
    password: env.REDIS_PASSWORD,
    socket: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT
    }
  };
}

export const redisClient = createClient(getRedisOptions());

redisClient.on("error", (error) => {
  console.error("Redis Client Error", error);
});

let connectPromise: Promise<void> | null = null;

export async function connectRedisClient() {
  if (!connectPromise) {
    connectPromise = redisClient.connect().then(() => undefined);
  }

  return connectPromise;
}

export async function testRedisConnection() {
  await connectRedisClient();
  const pong = await redisClient.ping();
  return pong;
}
