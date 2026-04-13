import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-serif",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "SET Marketing — Revenue Architecture for Operators",
  description: "We don't run campaigns. We install systems. Revenue architecture for operators generating $1M to $20M.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <head>
        <link rel="preload" as="video" href="/splash-bg-hd.mp4" type="video/mp4" />
      </head>
      <body>{children}</body>
    </html>
  );
}
