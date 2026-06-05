import { Router } from "express";
import { authController } from "../../controllers/auth.controller";
import { authenticate } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { authLimiter, otpLimiter } from "../../middleware/rate-limiter";
import {
  loginSchema,
  registerSchema,
  otpSendSchema,
  otpVerifySchema,
  googleAuthSchema,
  refreshTokenSchema,
  onboardingSchema,
} from "@d-chemistry/shared";

const router = Router();

// Public routes
router.post("/register", authLimiter, validate(registerSchema), authController.register.bind(authController));
router.post("/login", authLimiter, validate(loginSchema), authController.login.bind(authController));
router.post("/otp/send", otpLimiter, validate(otpSendSchema), authController.sendOtp.bind(authController));
router.post("/otp/verify", authLimiter, validate(otpVerifySchema), authController.verifyOtp.bind(authController));
router.post("/google", authLimiter, validate(googleAuthSchema), authController.googleAuth.bind(authController));
router.post("/refresh", validate(refreshTokenSchema), authController.refreshToken.bind(authController));

// Protected routes
router.post("/logout", authenticate, authController.logout.bind(authController));
router.post("/onboarding", authenticate, validate(onboardingSchema), authController.onboarding.bind(authController));
router.get("/me", authenticate, authController.me.bind(authController));

export { router as authRoutes };
