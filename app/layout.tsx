import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { siteDescription, siteName } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://elonlies.github.io"),
  title: {
    default: siteName,
    template: `%s · ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    "Elon Musk",
    "claims database",
    "trust score",
    "fact checking",
    "public promises",
  ],
  openGraph: {
    title: "Elon Musk Trust Score: 33/100",
    description:
      "See the 100 source-backed public claims behind the provisional score.",
    url: "https://elonlies.github.io/",
    type: "website",
    siteName,
    images: [
      {
        url: "/og.png",
        width: 1731,
        height: 909,
        alt: "Elon Musk Trust Score: 33 out of 100, not trustworthy.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Elon Musk Trust Score: 33/100",
    description:
      "See the 100 source-backed public claims behind the provisional score.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
