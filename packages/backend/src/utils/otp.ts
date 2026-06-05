import crypto from "crypto";
import nodemailer from "nodemailer";
import { env } from "../config/env";

export function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export function getOtpExpiry(): Date {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + env.OTP_EXPIRY_MINUTES);
  return expiry;
}

let transporter: nodemailer.Transporter | null = null;

if (env.SMTP_USER && env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

export async function sendOtpEmail(email: string, otp: string): Promise<boolean> {
  if (!transporter) {
    console.warn(`[DEV] OTP for ${email}: ${otp}`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: `"D-Chemistry" <${env.SMTP_USER}>`,
      to: email,
      subject: "Your D-Chemistry OTP Code",
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #F0F4F8; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #2D3142; font-size: 24px; margin: 0;">D-Chemistry</h1>
            <p style="color: #3AAFA9; font-size: 14px; margin: 4px 0 0;">Institute of Chemistry</p>
          </div>
          <div style="background: #FFFFFF; padding: 24px; border-radius: 12px; text-align: center;">
            <p style="color: #5C6480; font-size: 16px; margin: 0 0 16px;">Your verification code is:</p>
            <div style="font-size: 36px; font-weight: bold; color: #4ECDC4; letter-spacing: 8px; margin: 16px 0;">${otp}</div>
            <p style="color: #5C6480; font-size: 14px; margin: 16px 0 0;">This code expires in ${env.OTP_EXPIRY_MINUTES} minutes.</p>
          </div>
          <p style="color: #5C6480; font-size: 12px; text-align: center; margin-top: 16px;">
            If you didn't request this code, please ignore this email.
          </p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    return false;
  }
}
