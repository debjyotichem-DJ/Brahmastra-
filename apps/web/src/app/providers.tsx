"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { QueryProvider } from "../lib/query-client";
import { AuthProvider } from "../contexts/auth-context";
import { Toaster } from "react-hot-toast";
import "../i18n/config";
import { useEffect, useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryProvider>
        <AuthProvider>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'dark:bg-surface dark:text-foreground border border-border',
              duration: 4000,
            }}
          />
        </AuthProvider>
      </QueryProvider>
    </NextThemesProvider>
  );
}
