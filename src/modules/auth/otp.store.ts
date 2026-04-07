export type OtpRecord = {
  hash: string;
  expiresAt: number;
  attempts: number;
};

export interface OtpStore {
  set(key: string, value: OtpRecord, ttlMs: number): Promise<void>;
  get(key: string): Promise<OtpRecord | null>;
  incrementAttempts(key: string): Promise<number>;
  delete(key: string): Promise<void>;
}
