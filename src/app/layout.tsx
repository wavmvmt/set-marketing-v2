import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SET Marketing — Revenue Architecture for Operators",
  description: "We don't run campaigns. We install systems. Revenue architecture for operators generating $1M to $20M.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" as="video" href="/splash-bg-hd.mp4" type="video/mp4" />
      </head>
      <body>{children}</body>
    </html>
  );
}
