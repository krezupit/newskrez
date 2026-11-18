import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://newskrez.com"),
  title: {
    default: "NewsKrez | Global News, Healthcare, Technology & Regulatory Intelligence",
    template: "%s | NewsKrez Intelligence",
  },
  description:
    "Authoritative global news portal and regulatory intelligence hub covering pharmaceuticals, medical devices 510(k)/PMA, FDA recalls, WHO health alerts, AI technology, and GxP compliance.",
  keywords: [
    "NewsKrez",
    "Global News",
    "Regulatory Intelligence",
    "FDA Drug Approvals",
    "Medical Devices 510k",
    "FDA Recalls",
    "WHO Outbreaks",
    "EMA Regulations",
    "CDSCO Medical Devices",
    "Healthcare AI",
    "21 CFR Part 11",
    "ISO 13485",
  ],
  authors: [{ name: "NewsKrez Editorial & Regulatory Desk" }],
  creator: "NewsKrez Media Network",
  publisher: "NewsKrez",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://newskrez.com",
    siteName: "NewsKrez",
    title: "NewsKrez | Global News & Regulatory Intelligence",
    description:
      "Global News. Healthcare. Technology. Regulatory Intelligence. Real-time FDA, WHO, and MedTech clearance tracking.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200&auto=format&fit=crop&q=80",
        width: 1200,
        height: 630,
        alt: "NewsKrez Global News & Regulatory Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NewsKrez | Global News & Regulatory Intelligence",
    description: "Global News. Healthcare. Technology. Regulatory Intelligence.",
    images: ["https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200&auto=format&fit=crop&q=80"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#F8FAFC] text-navy-900 antialiased selection:bg-brandTeal-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
