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
  title: "SET Marketing — Revenue Architecture for Operators | $500M+ Generated",
  description: "We don't run campaigns. We install systems. Revenue architecture for operators generating $1M to $20M. Growth strategy, paid acquisition, funnel optimization, and fractional CMO services. Toronto & Miami.",
  keywords: ["revenue architecture", "growth strategy", "paid acquisition", "fractional CMO", "marketing agency", "Toronto marketing", "Miami marketing", "funnel optimization", "SET Marketing", "Chris Marchese"],
  authors: [{ name: "Chris Marchese", url: "https://thechris marchese.com" }],
  creator: "SET Marketing",
  publisher: "SET Enterprises",
  metadataBase: new URL("https://set-marketing-v2.vercel.app"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://set-marketing-v2.vercel.app",
    siteName: "SET Marketing",
    title: "SET Marketing — Revenue Architecture for Operators",
    description: "We don't run campaigns. We install systems. $500M+ in client revenue generated. Revenue architecture for operators generating $1M to $20M.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "SET Marketing — We Don't Run Campaigns. We Install Systems." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SET Marketing — Revenue Architecture for Operators",
    description: "We don't run campaigns. We install systems. $500M+ in client revenue generated.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
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
