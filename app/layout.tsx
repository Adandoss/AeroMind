import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
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
        <TopBar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
