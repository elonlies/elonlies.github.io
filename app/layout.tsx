import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { datasetStats } from "@/lib/data";
import { siteDescription, siteName } from "@/lib/site";
import "./globals.css";

const socialTitle = `Elon Musk Trust Score: ${datasetStats.roundedScore}%`;
const socialDescription = `See the ${datasetStats.totalRecords} source-backed public claims behind the provisional score.`;

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
    title: socialTitle,
    description: socialDescription,
    url: "https://elonlies.github.io/",
    type: "website",
    siteName,
    images: [
      {
        url: "/og.png",
        width: 1731,
        height: 909,
        alt: `Elon Musk Trust Score: ${datasetStats.roundedScore} percent, ${datasetStats.conclusion}.`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: socialTitle,
    description: socialDescription,
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
