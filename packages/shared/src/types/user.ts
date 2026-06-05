import { Role, Board, StudentClass, Language } from "../constants";

export interface User {
  id: string;
  email: string;
  phone: string | null;
  role: Role;
  googleId: string | null;
  fcmToken: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  profile: Profile | null;
}

export interface Profile {
  id: string;
  userId: string;
  name: string;
  avatar: string | null;
  class: StudentClass | null;
  board: Board | null;
  language: Language;
  bio: string | null;
  streak: number;
  lastActiveDate: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
  isNewUser: boolean;
}

export interface OtpSendRequest {
  email: string;
}

export interface OtpVerifyRequest {
  email: string;
  otp: string;
}

export interface GoogleAuthRequest {
  idToken: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface OnboardingRequest {
  name: string;
  class: StudentClass;
  board: Board;
  language: Language;
}

export interface UpdateProfileRequest {
  name?: string;
  bio?: string;
  class?: StudentClass;
  board?: Board;
  language?: Language;
}
