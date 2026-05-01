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

function normalizeGmailAppPassword(value: string) {
  return value.replace(/\s+/g, "");
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

  const gmailAppPassword = normalizeGmailAppPassword(env.GMAIL_APP_PASSWORD);

  if (!gmailAppPassword) {
    throw new AppError("GMAIL_APP_PASSWORD is empty", HTTP_STATUS.BAD_REQUEST);
  }

  const transportOptions = {
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    family: 4,
    auth: {
      user: env.GMAIL_USER,
      pass: gmailAppPassword
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

  try {
    await transporter.sendMail({
      from,
      to,
      ...content
    });
  } catch (error) {
    const smtpError = error as { code?: string; message?: string };

    console.error("[mail] Gmail send failed", {
      to,
      code: smtpError.code,
      message: smtpError.message
    });

    if (smtpError.code === "EAUTH") {
      throw new AppError(
        "Gmail authentication failed. Check GMAIL_USER and GMAIL_APP_PASSWORD.",
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    throw new AppError("Failed to send OTP email via Gmail", HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  console.log(`[mail] OTP sent via gmail to ${to}`);
}

export async function sendOtpEmail(to: string, otp: string) {
  if (env.EMAIL_PROVIDER === "gmail") {
    await sendWithGmail(to, otp);
    return;
  }

  await sendWithResend(to, otp);
}
