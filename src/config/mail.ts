import { Resend } from "resend";
import { env } from "./env.js";
import { AppError } from "../common/utils/AppError.js";
import { HTTP_STATUS } from "../common/utils/constants.js";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export async function sendOtpEmail(to: string, otp: string) {
  if (!resend) {
    throw new AppError("RESEND_API_KEY is not configured", HTTP_STATUS.BAD_REQUEST);
  }

  const from = env.RESEND_FROM ?? "GroupFinder <no-reply@groupfinder.com>";

  await resend.emails.send({
    from,
    to,
    subject: "Your GroupFinder OTP",
    text: `Your OTP is ${otp}. It expires in 5 minutes.`,
    html: `<p>Your OTP is <strong>${otp}</strong>. It expires in 5 minutes.</p>`
  });
}
