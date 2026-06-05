import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Chatbot } from "@/components/chat/Chatbot";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const syne = Syne({ 
  subsets: ["latin"],
  variable: "--font-syne",
});

export const metadata: Metadata = {
  title: "D-Chemistry | Institute of Chemistry",
  description: "Premier chemistry institute for JEE, NEET, ISC, and ICSE preparation by Debajyoti Haldar.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${syne.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <Providers>
          {children}
          <Chatbot />
        </Providers>
      </body>
    </html>
  );
}
