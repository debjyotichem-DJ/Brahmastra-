import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password too long"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
});

export const otpSendSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const otpVerifySchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must contain only digits"),
});

export const googleAuthSchema = z.object({
  idToken: z.string().min(1, "ID token is required"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const onboardingSchema = z.object({
  name: z.string().min(2).max(100),
  class: z.enum(["10", "11", "12"]),
  board: z.enum(["ICSE", "ISC", "CBSE", "JEE", "NEET"]),
  language: z.enum(["en", "bn"]).default("en"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  class: z.enum(["10", "11", "12"]).optional(),
  board: z.enum(["ICSE", "ISC", "CBSE", "JEE", "NEET"]).optional(),
  language: z.enum(["en", "bn"]).optional(),
});

export const updateFcmTokenSchema = z.object({
  fcmToken: z.string().min(1, "FCM token is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type OtpSendInput = z.infer<typeof otpSendSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
