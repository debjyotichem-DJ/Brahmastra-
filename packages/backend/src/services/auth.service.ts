import { prisma } from "../config/database";
import { hashPassword, comparePassword } from "../utils/hash";
import { generateTokenPair, verifyRefreshToken } from "../utils/jwt";
import { generateOtp, getOtpExpiry, sendOtpEmail } from "../utils/otp";
import { AppError } from "../middleware/error-handler";
import crypto from "crypto";

export class AuthService {
  async register(email: string, password: string, name: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError("Email already registered", 409);
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        profile: {
          create: { name },
        },
      },
      include: { profile: true },
    });

    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return { user, tokens, isNewUser: true };
  }

  async loginWithEmail(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user || !user.passwordHash) {
      throw new AppError("Invalid email or password", 401);
    }

    if (!user.isActive) {
      throw new AppError("Account has been deactivated", 403);
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      throw new AppError("Invalid email or password", 401);
    }

    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return { user, tokens, isNewUser: !user.profile?.class };
  }

  async sendOtp(email: string) {
    const otp = generateOtp();
    const expiresAt = getOtpExpiry();

    // Invalidate previous OTPs
    await prisma.otpCode.updateMany({
      where: { email, used: false },
      data: { used: true },
    });

    await prisma.otpCode.create({
      data: { email, code: otp, expiresAt },
    });

    const sent = await sendOtpEmail(email, otp);
    if (!sent) {
      throw new AppError("Failed to send OTP email", 500);
    }

    return { message: "OTP sent successfully" };
  }

  async verifyOtp(email: string, code: string) {
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        email,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      throw new AppError("Invalid or expired OTP", 401);
    }

    // Mark OTP as used
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    let isNewUser = false;

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          profile: {
            create: { name: email.split("@")[0] ?? "Student" },
          },
        },
        include: { profile: true },
      });
      isNewUser = true;
    }

    if (!user.isActive) {
      throw new AppError("Account has been deactivated", 403);
    }

    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return { user, tokens, isNewUser: isNewUser || !user.profile?.class };
  }

  async loginWithGoogle(idToken: string) {
    // Verify Google ID token
    const googleUser = await this.verifyGoogleToken(idToken);

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId: googleUser.sub },
          { email: googleUser.email },
        ],
      },
      include: { profile: true },
    });

    let isNewUser = false;

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          googleId: googleUser.sub,
          profile: {
            create: {
              name: googleUser.name ?? googleUser.email.split("@")[0] ?? "Student",
              avatar: googleUser.picture,
            },
          },
        },
        include: { profile: true },
      });
      isNewUser = true;
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: googleUser.sub },
        include: { profile: true },
      });
    }

    if (!user.isActive) {
      throw new AppError("Account has been deactivated", 403);
    }

    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return { user, tokens, isNewUser: isNewUser || !user.profile?.class };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = verifyRefreshToken(refreshToken);

      // Check token exists in DB
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      if (!storedToken) {
        throw new AppError("Invalid refresh token", 401);
      }

      // Delete old token (rotation)
      await prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: { profile: true },
      });

      if (!user || !user.isActive) {
        throw new AppError("User not found or inactive", 401);
      }

      const tokens = generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      await this.storeRefreshToken(user.id, tokens.refreshToken);

      return { user, tokens };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Invalid refresh token", 401);
    }
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { userId, token: refreshToken },
      });
    } else {
      // Delete all refresh tokens for user
      await prisma.refreshToken.deleteMany({
        where: { userId },
      });
    }
  }

  async completeOnboarding(
    userId: string,
    data: { name: string; class: string; board: string; language: string }
  ) {
    const classMap: Record<string, "CLASS_10" | "CLASS_11" | "CLASS_12"> = {
      "10": "CLASS_10",
      "11": "CLASS_11",
      "12": "CLASS_12",
    };

    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        name: data.name,
        class: classMap[data.class],
        board: data.board as "ICSE" | "ISC" | "CBSE" | "JEE" | "NEET",
        language: data.language === "bn" ? "BN" : "EN",
      },
      create: {
        userId,
        name: data.name,
        class: classMap[data.class],
        board: data.board as "ICSE" | "ISC" | "CBSE" | "JEE" | "NEET",
        language: data.language === "bn" ? "BN" : "EN",
      },
    });

    // Create default notification preferences
    await prisma.notificationPreference.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    return profile;
  }

  private async storeRefreshToken(userId: string, token: string) {
    // Clean up expired tokens
    await prisma.refreshToken.deleteMany({
      where: {
        userId,
        expiresAt: { lt: new Date() },
      },
    });

    // Store new token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.refreshToken.create({
      data: { userId, token, expiresAt },
    });
  }

  private async verifyGoogleToken(idToken: string): Promise<{
    sub: string;
    email: string;
    name?: string;
    picture?: string;
  }> {
    // Verify with Google's tokeninfo endpoint
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
    );

    if (!response.ok) {
      throw new AppError("Invalid Google ID token", 401);
    }

    const data = (await response.json()) as {
      sub: string;
      email: string;
      name?: string;
      picture?: string;
    };

    return data;
  }
}

export const authService = new AuthService();
