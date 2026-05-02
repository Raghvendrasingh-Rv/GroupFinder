import { google } from "googleapis";
import { Resend } from "resend";
import { env } from "./env.js";
import { AppError } from "../common/utils/AppError.js";
import { HTTP_STATUS } from "../common/utils/constants.js";

function buildOtpContent(otp: string) {
  return {
    subject: "Your GroupFinder OTP",
    text: [
      "Welcome to GroupFinder!",
      "",
      `Your OTP is ${otp}.`,
      "It expires in 5 minutes.",
      "",
      "If you did not request this code, you can safely ignore this email."
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; background: #f8fafc; padding: 24px;">
        <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 28px 32px;">
            <div style="font-size: 13px; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.9;">GroupFinder</div>
            <h1 style="margin: 10px 0 0; font-size: 28px;">Your OTP is ready</h1>
          </div>
          <div style="padding: 32px;">
            <p style="margin: 0 0 16px;">Welcome to <strong>GroupFinder</strong>, your space to discover and join events, connect with people, and build communities around shared interests.</p>
            <p style="margin: 0 0 24px;">Use the verification code below to continue:</p>
            <div style="display: inline-block; background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; font-size: 32px; font-weight: 700; letter-spacing: 0.2em; padding: 14px 22px; border-radius: 12px;">${otp}</div>
            <p style="margin: 24px 0 0;">This code expires in <strong>5 minutes</strong>.</p>
            <p style="margin: 12px 0 0; color: #6b7280; font-size: 14px;">If you did not request this code, you can safely ignore this email.</p>
          </div>
        </div>
      </div>
    `
  };
}

function buildMimeMessage(from: string, to: string, subject: string, text: string, html: string) {
  const message = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="UTF-8"',
    "",
    html,
    "",
    text
  ].join("\r\n");

  return Buffer.from(message).toString("base64url");
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

async function sendWithGmailApi(to: string, otp: string) {
  const clientId = env.GMAIL_CLIENT_ID;
  const clientSecret = env.GMAIL_CLIENT_SECRET;
  const refreshToken = env.GMAIL_REFRESH_TOKEN;
  const senderEmail = env.GMAIL_SENDER_EMAIL;

  if (!clientId || !clientSecret || !refreshToken || !senderEmail) {
    throw new AppError(
      "GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN and GMAIL_SENDER_EMAIL are required for gmail provider",
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const accessTokenResponse = await oauth2Client.getAccessToken();
  const accessToken =
    typeof accessTokenResponse === "string"
      ? accessTokenResponse
      : accessTokenResponse?.token ?? null;

  if (!accessToken) {
    throw new AppError("Failed to get Gmail API access token", HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  const gmail = google.gmail({
    version: "v1",
    auth: oauth2Client
  });

  const content = buildOtpContent(otp);
  const rawMessage = buildMimeMessage(senderEmail, to, content.subject, content.text, content.html);

  try {
    await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: rawMessage
      }
    });
  } catch (error) {
    const gmailError = error as { code?: number; message?: string };

    console.error("[mail] Gmail API send failed", {
      to,
      code: gmailError.code,
      message: gmailError.message
    });

    if (gmailError.code === 401 || gmailError.code === 403) {
      throw new AppError(
        "Gmail API authentication failed. Check OAuth credentials and refresh token.",
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    throw new AppError("Failed to send OTP email via Gmail API", HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  console.log(`[mail] OTP sent via gmail api to ${to}`);
}

export async function sendOtpEmail(to: string, otp: string) {
  if (env.EMAIL_PROVIDER === "gmail") {
    await sendWithGmailApi(to, otp);
    return;
  }

  await sendWithResend(to, otp);
}
