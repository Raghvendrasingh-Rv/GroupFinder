import { connectRedisClient, redisClient } from "../../config/redis.js";
import type { OtpRecord, OtpStore } from "./otp.store.js";

const OTP_PREFIX = "otp:";

function serialize(record: OtpRecord) {
  return JSON.stringify(record);
}

function deserialize(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as OtpRecord;
  } catch {
    return null;
  }
}

class RedisOtpStore implements OtpStore {
  private ready: Promise<void>;

  constructor() {
    this.ready = connectRedisClient();
  }

  private async ensureReady() {
    await this.ready;
    if (!redisClient.isOpen) {
      await connectRedisClient();
    }
  }

  async set(key: string, value: OtpRecord, ttlMs: number) {
    await this.ensureReady();
    await redisClient.set(`${OTP_PREFIX}${key}`, serialize(value), {
      PX: ttlMs
    });
  }

  async get(key: string) {
    await this.ensureReady();
    const raw = await redisClient.get(`${OTP_PREFIX}${key}`);
    return deserialize(raw);
  }

  async incrementAttempts(key: string) {
    await this.ensureReady();
    const redisKey = `${OTP_PREFIX}${key}`;
    const raw = await redisClient.get(redisKey);
    const record = deserialize(raw);

    if (!record) {
      return 0;
    }

    const nextRecord: OtpRecord = {
      ...record,
      attempts: record.attempts + 1
    };

    const ttl = await redisClient.pTTL(redisKey);
    if (ttl > 0) {
      await redisClient.set(redisKey, serialize(nextRecord), {
        PX: ttl
      });
    } else {
      await redisClient.set(redisKey, serialize(nextRecord));
    }

    return nextRecord.attempts;
  }

  async delete(key: string) {
    await this.ensureReady();
    await redisClient.del(`${OTP_PREFIX}${key}`);
  }
}

export function createRedisOtpStore() {
  return new RedisOtpStore();
}
