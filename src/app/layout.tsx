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
  title: {
    default: "SET Marketing — Fractional CMO & Revenue Architecture | Toronto & Miami",
    template: "%s | SET Marketing",
  },
  description: "SET Marketing delivers fractional CMO leadership, revenue architecture, and growth strategy for operators generating $1M–$20M. $500M+ in client revenue generated. Based in Toronto & Miami.",
  keywords: ["fractional CMO", "fractional CMO Toronto", "fractional CMO Miami", "revenue architecture", "growth strategy", "marketing agency Toronto", "marketing agency Miami", "paid acquisition", "funnel optimization", "SET Marketing", "Chris Marchese", "B2B marketing strategy", "demand generation", "performance marketing"],
  authors: [{ name: "Chris Marchese", url: "https://thechrismarchese.com" }],
  creator: "SET Marketing",
  publisher: "SET Enterprises",
  metadataBase: new URL("https://marketingbyset.com"),
  alternates: { canonical: "https://marketingbyset.com" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://marketingbyset.com",
    siteName: "SET Marketing",
    title: "SET Marketing — Fractional CMO & Revenue Architecture for Operators",
    description: "We don't run campaigns. We install systems. $500M+ in client revenue generated. Fractional CMO and growth strategy for operators generating $1M–$20M. Toronto & Miami.",
    images: [{ url: "https://marketingbyset.com/og-image.jpg", width: 1200, height: 630, alt: "SET Marketing — Fractional CMO & Revenue Architecture | Toronto & Miami" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@marketingbyset",
    creator: "@thechrismarchese",
    title: "SET Marketing — Fractional CMO & Revenue Architecture",
    description: "We don't run campaigns. We install systems. $500M+ in client revenue generated. Toronto & Miami.",
    images: ["https://marketingbyset.com/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  verification: {
    google: "REPLACE_WITH_GSC_VERIFICATION_CODE",
  },
  category: "Marketing Agency",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://marketingbyset.com/#organization",
        name: "SET Marketing",
        alternateName: "Marketing by SET",
        url: "https://marketingbyset.com",
        logo: {
          "@type": "ImageObject",
          url: "https://marketingbyset.com/og-image.jpg",
          width: 1200,
          height: 630,
        },
        description: "SET Marketing delivers fractional CMO leadership, revenue architecture, and growth strategy for operators generating $1M–$20M. $500M+ in client revenue generated.",
        foundingDate: "2019",
        founder: {
          "@type": "Person",
          name: "Chris Marchese",
          url: "https://thechrismarchese.com",
          sameAs: [
            "https://www.linkedin.com/in/thechrismarchese/",
            "https://www.instagram.com/thechrismarchese/",
            "https://www.imdb.com/name/nm17934193/",
          ],
        },
        sameAs: [
          "https://www.linkedin.com/company/set-marketing",
          "https://www.instagram.com/marketingbyset/",
          "https://www.facebook.com/marketingbyset/",
        ],
        contactPoint: [
          {
            "@type": "ContactPoint",
            telephone: "+1-647-985-3993",
            contactType: "sales",
            email: "chris@marketingbyset.com",
            areaServed: ["CA", "US"],
            availableLanguage: "English",
          },
        ],
        address: [
          {
            "@type": "PostalAddress",
            streetAddress: "5 Mariner Terrace",
            addressLocality: "Toronto",
            addressRegion: "ON",
            addressCountry: "CA",
          },
          {
            "@type": "PostalAddress",
            addressLocality: "Miami",
            addressRegion: "FL",
            addressCountry: "US",
          },
        ],
        knowsAbout: [
          "Fractional CMO",
          "Revenue Architecture",
          "Growth Strategy",
          "Paid Acquisition",
          "Funnel Optimization",
          "B2B Marketing",
          "Demand Generation",
          "Performance Marketing",
        ],
      },
      {
        "@type": "ProfessionalService",
        "@id": "https://marketingbyset.com/#service",
        name: "SET Marketing",
        url: "https://marketingbyset.com",
        priceRange: "$$$",
        image: "https://marketingbyset.com/og-image.jpg",
        telephone: "+1-647-985-3993",
        email: "chris@marketingbyset.com",
        areaServed: [
          { "@type": "Country", name: "Canada" },
          { "@type": "Country", name: "United States" },
        ],
        serviceType: [
          "Fractional CMO",
          "Marketing Strategy",
          "Revenue Architecture",
          "Growth Strategy",
          "Paid Media Management",
          "Funnel Optimization",
        ],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Marketing Services",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Fractional CMO",
                description: "Executive-level marketing leadership on a flexible basis for growing businesses.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Revenue Architecture",
                description: "Full-stack marketing systems design for sustainable revenue growth.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Paid Acquisition",
                description: "High-performance paid media campaigns across Google, Meta, and LinkedIn.",
              },
            },
          ],
        },
      },
      {
        "@type": "WebSite",
        "@id": "https://marketingbyset.com/#website",
        url: "https://marketingbyset.com",
        name: "SET Marketing",
        publisher: { "@id": "https://marketingbyset.com/#organization" },
      },
    ],
  };

  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <head>
        <link rel="preload" as="video" href="/splash-bg-hd.mp4" type="video/mp4" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="canonical" href="https://marketingbyset.com" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SET Marketing" />
        <meta name="geo.region" content="CA-ON" />
        <meta name="geo.placename" content="Toronto" />
        <meta name="geo.position" content="43.6426;-79.3871" />
        <meta name="ICBM" content="43.6426, -79.3871" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
