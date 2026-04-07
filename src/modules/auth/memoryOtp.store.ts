import type { OtpRecord, OtpStore } from "./otp.store.js";

const store = new Map<string, OtpRecord>();

export class MemoryOtpStore implements OtpStore {
  async set(key: string, value: OtpRecord, ttlMs: number) {
    store.set(key, value);
    setTimeout(() => {
      store.delete(key);
    }, ttlMs).unref?.();
  }

  async get(key: string) {
    const record = store.get(key);
    if (!record) {
      return null;
    }

    if (Date.now() > record.expiresAt) {
      store.delete(key);
      return null;
    }

    return record;
  }

  async incrementAttempts(key: string) {
    const record = await this.get(key);
    if (!record) {
      return 0;
    }

    const nextRecord = {
      ...record,
      attempts: record.attempts + 1
    };

    store.set(key, nextRecord);
    return nextRecord.attempts;
  }

  async delete(key: string) {
    store.delete(key);
  }
}
