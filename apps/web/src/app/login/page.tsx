"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/auth-context";
import { apiClient } from "@/lib/api-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { loginSchema } from "@d-chemistry/shared";

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      const res = await apiClient.post("/auth/login", data);
      
      if (res.data.success) {
        const { tokens, user } = res.data.data;
        login(tokens.accessToken, tokens.refreshToken, user);
        toast.success(t("auth.welcomeBack", "Welcome Back!"));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("common.error", "Something went wrong"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg hexagon-bg p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-slide-down">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-white shadow-glow mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
            </svg>
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            {t("auth.loginTitle", "Log in to D-Chemistry")}
          </h1>
          <p className="text-muted">
            {t("auth.loginSubtitle", "Continue your chemistry journey")}
          </p>
        </div>

        <div className="card p-8 animate-scale-in">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground">
                {t("auth.email", "Email Address")}
              </label>
              <Input
                {...register("email")}
                type="email"
                placeholder="student@example.com"
                error={!!errors.email}
              />
              {errors.email && (
                <p className="text-error text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground">
                {t("auth.password", "Password")}
              </label>
              <Input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                error={!!errors.password}
              />
              {errors.password && (
                <p className="text-error text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between py-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-border text-primary focus:ring-primary h-4 w-4" />
                <span className="text-sm text-muted">Remember me</span>
              </label>
              <button type="button" className="text-sm text-primary hover:underline font-medium">
                {t("auth.forgotPassword", "Forgot Password?")}
              </button>
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              {t("common.login", "Log In")}
            </Button>
          </form>

          <div className="mt-6 molecule-divider">
            <span className="text-sm text-muted bg-surface px-2 whitespace-nowrap">
              {t("common.or", "or")}
            </span>
          </div>

          <div className="mt-6 space-y-3">
            <Button variant="outline" className="w-full relative bg-white dark:bg-surface text-foreground hover:bg-surface-2" size="lg">
              <svg className="absolute left-4 w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {t("auth.googleLogin", "Continue with Google")}
            </Button>
            
            <Button variant="outline" className="w-full" size="lg">
              {t("auth.otpLogin", "Login with OTP")}
            </Button>
          </div>
        </div>

        <p className="text-center mt-8 text-sm text-muted">
          {t("auth.noAccount", "Don't have an account?")}{" "}
          <button className="text-primary font-medium hover:underline">
            {t("common.signup", "Sign Up")}
          </button>
        </p>
      </div>
    </div>
  );
}
