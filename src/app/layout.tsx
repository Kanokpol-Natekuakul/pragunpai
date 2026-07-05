import type { Metadata, Viewport } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

import { PublicSiteChrome } from "@/components/layout/PublicSiteChrome";
import { GoogleAnalytics } from "@/components/seo/Analytics";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/lib/jsonld";
import { siteConfig } from "@/lib/site";
import { prisma } from "@/lib/prisma";

const notoThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — เปรียบเทียบแผนประกันภัย ขอใบเสนอราคาง่าย`,
    template: `%s | ${siteConfig.name}`,
  },
  description:
    "Pragunpai ให้คำปรึกษาและเปรียบเทียบแผนประกันภัย พ.ร.บ. รถยนต์ ประกันอุบัติเหตุ และประกันบ้าน/คอนโด ช่วยให้คุณเลือกความคุ้มครองที่เหมาะสมก่อนตัดสินใจ ขอใบเสนอราคาฟรี บริการทั่วประเทศ",
  keywords: [
    "ประกันภัย",
    "พรบ",
    "พ.ร.บ. รถยนต์",
    "ประกันอุบัติเหตุ",
    "ประกันบ้าน",
    "ประกันคอนโด",
    "เปรียบเทียบประกัน",
    "ขอใบเสนอราคาประกัน",
    "Pragunpai",
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  applicationName: siteConfig.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — เปรียบเทียบแผนประกันภัย`,
    description:
      "ให้คำปรึกษาและเปรียบเทียบแผนประกันภัย ช่วยให้คุณเลือกความคุ้มครองที่เหมาะสม ขอใบเสนอราคาฟรี",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — เปรียบเทียบแผนประกันภัย`,
    description:
      "ให้คำปรึกษาและเปรียบเทียบแผนประกันภัย ขอใบเสนอราคาฟรี บริการทั่วประเทศ",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: siteConfig.tracking.gscVerification
    ? { google: siteConfig.tracking.gscVerification }
    : undefined,
};

export const viewport: Viewport = {
  themeColor: "#283e6c",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let logoUrl = "";
  let faviconUrl = "/favicon.ico";

  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "siteLogoConfig" },
    });
    if (
      setting &&
      typeof setting.value === "object" &&
      setting.value !== null
    ) {
      const val = setting.value as { logoUrl?: string; faviconUrl?: string };
      logoUrl = val.logoUrl || "";
      faviconUrl = val.faviconUrl || "/favicon.ico";
    }
  } catch (error) {
    console.error("[RootLayout] Failed to load logo config:", error);
  }

  return (
    <html
      lang="th"
      data-scroll-behavior="smooth"
      className={`${notoThai.variable} h-full`}
    >
      <head>
        <link rel="icon" href={faviconUrl} />
        <link rel="shortcut icon" href={faviconUrl} />
      </head>
      <body className="min-h-full flex flex-col bg-white text-navy-800 antialiased">
        <GoogleAnalytics />
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <PublicSiteChrome logoUrl={logoUrl}>{children}</PublicSiteChrome>
      </body>
    </html>
  );
}
