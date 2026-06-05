import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { sendSuccess, sendError } from "../utils/response";

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = req.body;
      const result = await authService.register(email, password, name);
      sendSuccess(res, result, "Registration successful", 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.loginWithEmail(email, password);
      sendSuccess(res, result, "Login successful");
    } catch (error) {
      next(error);
    }
  }

  async sendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await authService.sendOtp(email);
      sendSuccess(res, result, "OTP sent");
    } catch (error) {
      next(error);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body;
      const result = await authService.verifyOtp(email, otp);
      sendSuccess(res, result, "OTP verified");
    } catch (error) {
      next(error);
    }
  }

  async googleAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const { idToken } = req.body;
      const result = await authService.loginWithGoogle(idToken);
      sendSuccess(res, result, "Google authentication successful");
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshTokens(refreshToken);
      sendSuccess(res, result, "Token refreshed");
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { refreshToken } = req.body;
      await authService.logout(userId, refreshToken);
      sendSuccess(res, null, "Logged out successfully");
    } catch (error) {
      next(error);
    }
  }

  async onboarding(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const profile = await authService.completeOnboarding(userId, req.body);
      sendSuccess(res, profile, "Onboarding completed");
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const { prisma } = await import("../config/database");
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        include: { profile: true },
      });

      if (!user) {
        sendError(res, "User not found", 404);
        return;
      }

      const { passwordHash, ...safeUser } = user;
      sendSuccess(res, safeUser);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
