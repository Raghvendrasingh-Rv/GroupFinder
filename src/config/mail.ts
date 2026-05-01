import nodemailer from "nodemailer";
import { Resend } from "resend";
import { env } from "./env.js";
import { AppError } from "../common/utils/AppError.js";
import { HTTP_STATUS } from "../common/utils/constants.js";

function buildOtpContent(otp: string) {
  return {
    subject: "Your GroupFinder OTP",
    text: `Your OTP is ${otp}. It expires in 5 minutes.`,
    html: `<p>Your OTP is <strong>${otp}</strong>. It expires in 5 minutes.</p>`
  };
}

async function sendWithResend(to: string, otp: string) {
  if (!env.RESEND_API_KEY) {
    throw new AppError("RESEND_API_KEY is not configured", HTTP_STATUS.BAD_REQUEST);
  }

  const resend = new Resend(env.RESEND_API_KEY);
  const from = env.RESEND_FROM ?? "GroupFinder <no-reply@groupfinder.com>";
  const content = buildOtpContent(otp);

  await resend.emails.send({
    from,
    to,
    ...content
  });

  console.log(`[mail] OTP sent via resend to ${to}`);
}

async function sendWithGmail(to: string, otp: string) {
  if (!env.GMAIL_USER || !env.GMAIL_APP_PASSWORD) {
    throw new AppError("GMAIL_USER and GMAIL_APP_PASSWORD are required for gmail provider", HTTP_STATUS.BAD_REQUEST);
  }

  const transportOptions = {
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    family: 4,
    auth: {
      user: env.GMAIL_USER,
      pass: env.GMAIL_APP_PASSWORD
    },
    requireTLS: true,
    tls: {
      minVersion: "TLSv1.2"
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000
  } as const;

  const transporter = nodemailer.createTransport(transportOptions);

  const from = env.GMAIL_FROM ?? env.GMAIL_USER;
  const content = buildOtpContent(otp);

  await transporter.sendMail({
    from,
    to,
    ...content
  });

  console.log(`[mail] OTP sent via gmail to ${to}`);
}

export async function sendOtpEmail(to: string, otp: string) {
  if (env.EMAIL_PROVIDER === "gmail") {
    await sendWithGmail(to, otp);
    return;
  }

  await sendWithResend(to, otp);
}
