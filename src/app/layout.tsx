import type { Metadata } from "next";
import { Inter, DM_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "실시간 김치프리미엄 · 고래지갑 추적 | SHUD Crypto Tools",
  description: "실시간 김치 프리미엄 확인, 고래 지갑 추적, 암호화폐 시세 모니터링. 무료 크립토 도구 모음 - 김프 계산기, 이더리움 고래 알림, BTC ETH SOL 실시간 가격.",
  keywords: "김치 프리미엄, 김프 실시간, 고래 지갑 추적, 이더리움 고래, 크립토 도구, 암호화폐 시세, BTC 가격, ETH 가격, 실시간 시세",
  openGraph: {
    title: "실시간 김치프리미엄 · 고래지갑 추적 | SHUD Crypto Tools",
    description: "김치 프리미엄 실시간 확인, 고래 지갑 추적, 암호화폐 시세 모니터링. 무료 크립토 도구.",
    type: "website",
    url: "https://tftchess.com",
    locale: "ko_KR",
    siteName: "SHUD Crypto Tools",
  },
  twitter: {
    card: "summary",
    title: "실시간 김치프리미엄 · 고래지갑 추적 | SHUD Crypto Tools",
    description: "김치 프리미엄 실시간 확인, 고래 지갑 추적, 암호화폐 시세 모니터링.",
  },
  alternates: {
    canonical: "https://tftchess.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <meta name="robots" content="index, follow" />
        {/* Google AdSense */}
        <meta name="google-adsense-account" content="ca-pub-8600828705366909" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8600828705366909"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${inter.variable} ${dmMono.variable} ${instrumentSerif.variable} antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
