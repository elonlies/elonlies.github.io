import type { Metadata } from "next";
import { headers } from "next/headers";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { siteDescription, siteName } from "@/lib/site";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");
  const metadataBase = new URL(`${protocol}://${host}`);

  return {
    metadataBase,
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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
