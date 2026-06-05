"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api-client";
import { useRouter, usePathname } from "next/navigation";

interface UserProfile {
  name: string;
  avatar: string | null;
  class: string | null;
  board: string | null;
  language: "EN" | "BN";
}

interface User {
  id: string;
  email: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  isActive: boolean;
  profile: UserProfile | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken: string, userData: User) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const { data: user, isLoading: isQueryLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return null;
      try {
        const { data } = await apiClient.get<{ data: User }>("/auth/me");
        return data.data;
      } catch (error) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 mins
  });

  useEffect(() => {
    if (!isQueryLoading) {
      setIsInitialized(true);
    }
  }, [isQueryLoading]);

  useEffect(() => {
    if (!isInitialized) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    if (!user && !isPublicRoute) {
      router.replace("/login");
    } else if (user && isPublicRoute) {
      router.replace("/dashboard");
    } else if (user && !user.profile?.class && pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, [user, isInitialized, pathname, router]);

  const login = (accessToken: string, refreshToken: string, userData: User) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    queryClient.setQueryData(["currentUser"], userData);
    
    if (!userData.profile?.class) {
      router.push("/onboarding");
    } else {
      router.push("/dashboard");
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await apiClient.post("/auth/logout", { refreshToken });
      }
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      queryClient.setQueryData(["currentUser"], null);
      router.push("/login");
    }
  };

  const updateUser = (data: Partial<User>) => {
    queryClient.setQueryData(["currentUser"], (old: User | null) => {
      if (!old) return null;
      return { ...old, ...data, profile: { ...old.profile, ...data.profile } as UserProfile };
    });
  };

  const isLoading = !isInitialized || isQueryLoading;

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
      }}
    >
      {/* Don't render protected children until auth is initialized, except for public routes */}
      {isLoading && !PUBLIC_ROUTES.includes(pathname) ? (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="atom-spinner">
            <div className="nucleus"></div>
            <div className="orbit"></div>
            <div className="orbit"></div>
            <div className="orbit"></div>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
