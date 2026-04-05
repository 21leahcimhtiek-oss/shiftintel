import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "ShiftIntel", template: "%s | ShiftIntel" },
  description: "AI-driven workforce scheduling and shift intelligence for modern enterprises",
  keywords: ["workforce scheduling", "shift management", "AI scheduling", "labor cost forecasting"],
  openGraph: {
    title: "ShiftIntel — AI Workforce Scheduling",
    description: "AI-optimized schedules. Zero coverage gaps.",
    type: "website",
    url: "https://shiftintel.com",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}