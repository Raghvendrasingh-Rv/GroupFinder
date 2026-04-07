import crypto from "node:crypto";

export function normalizeOtpKey(value?: string) {
  return value?.trim().toLowerCase();
}

export function createOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function hashOtp(otp: string) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export function hashEquals(leftHex: string, rightHex: string) {
  const left = Buffer.from(leftHex, "hex");
  const right = Buffer.from(rightHex, "hex");

  if (left.length !== right.length) {
    return false;
  }

  return crypto.timingSafeEqual(left, right);
}
