import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cardboard Mania — Your card page, your way",
  description:
    "Build a personalized page for your card collection: want lists, have lists, show schedule, and more. For dealers and collectors across sports, non-sports, and TCGs.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
