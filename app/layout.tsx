import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/layout/Providers";
import { Suspense } from "react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AeroMind - Precision in Learning",
  description:
    "Structured learning for creative professionals. High-fidelity education designed with Swiss precision and intellectual rigor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <Suspense fallback={
            <header className="border-b border-zinc-200 bg-zinc-50/50 backdrop-blur-md">
              <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
                <div className="text-xl font-bold tracking-tight text-zinc-900">
                  AeroMind
                </div>
                <div className="w-16 h-8 bg-zinc-200/60 rounded animate-pulse" />
              </div>
            </header>
          }>
            <TopBar />
          </Suspense>
          <Suspense fallback={
            <div className="flex-1 flex items-center justify-center py-24 bg-zinc-50">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-950" />
            </div>
          }>
            {children}
          </Suspense>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
