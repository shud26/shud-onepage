import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | SHUD Crypto",
    default: "코딩 입문자의 크립토 자동화 일지 | SHUD Crypto",
  },
  description:
    "코딩을 모르는 선생님이 AI(Claude Code)로 크립토 봇을 만들어가는 실전 기록. 펀딩비 차익거래, 에어드랍 파밍, 김프봇 개발 경험을 솔직하게 씁니다.",
  keywords:
    "바이브코딩, vibe coding, 크립토 봇, 펀딩비 차익거래, 에어드랍 파밍, Claude Code, 코딩 입문, 암호화폐 자동화",
  openGraph: {
    title: "코딩 입문자의 크립토 자동화 일지 | SHUD Crypto",
    description:
      "코딩을 모르는 선생님이 AI로 크립토 봇을 만들어가는 실전 기록.",
    type: "website",
    url: "https://tftchess.com",
    locale: "ko_KR",
    siteName: "SHUD Crypto",
  },
  twitter: {
    card: "summary",
    title: "코딩 입문자의 크립토 자동화 일지 | SHUD Crypto",
    description: "코딩을 모르는 선생님이 AI로 크립토 봇을 만들어가는 실전 기록.",
  },
  alternates: {
    canonical: "https://tftchess.com",
  },
};

function Header() {
  return (
    <header
      style={{
        borderBottom: "1px solid var(--border)",
        background: "rgba(13,13,15,0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        className="container-wide"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 56,
        }}
      >
        <Link
          href="/"
          style={{
            fontWeight: 700,
            fontSize: 16,
            color: "var(--text-primary)",
            textDecoration: "none",
            letterSpacing: "-0.02em",
          }}
        >
          SHUD<span style={{ color: "var(--accent)" }}>.</span>dev
        </Link>

        <nav style={{ display: "flex", gap: 28, alignItems: "center" }}>
          <Link href="/" className="nav-link">
            홈
          </Link>
          <Link href="/blog" className="nav-link">
            블로그
          </Link>
          <Link href="/blog?tab=series" className="nav-link">
            시리즈
          </Link>
          <Link href="/about" className="nav-link">
            소개
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        marginTop: 80,
        padding: "32px 0",
      }}
    >
      <div
        className="container-wide"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
          © 2026 SHUD Crypto · 바이브코딩으로 만들었습니다
        </span>
        <div style={{ display: "flex", gap: 20 }}>
          <Link
            href="/privacy"
            style={{ fontSize: 13, color: "var(--text-tertiary)", textDecoration: "none" }}
          >
            개인정보처리방침
          </Link>
          <Link
            href="/contact"
            style={{ fontSize: 13, color: "var(--text-tertiary)", textDecoration: "none" }}
          >
            연락하기
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <meta name="robots" content="index, follow" />
        <meta name="google-adsense-account" content="ca-pub-8600828705366909" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8600828705366909"
          crossOrigin="anonymous"
        />
      </head>
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Header />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
