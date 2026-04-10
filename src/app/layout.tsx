import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | SHUD",
    default: "코딩 입문자의 크립토 자동화 일지 | SHUD",
  },
  description:
    "코딩 한 줄 못 짜던 사람이 AI(Claude Code)로 크립토 봇을 만들어가는 실전 기록.",
  keywords: "바이브코딩, 크립토 봇, 펀딩비 차익거래, 에어드랍 파밍, Claude Code",
  openGraph: {
    type: "website",
    url: "https://tftchess.com",
    locale: "ko_KR",
    siteName: "SHUD",
  },
  alternates: { canonical: "https://tftchess.com" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
        <header
          style={{
            borderBottom: "1px solid var(--border)",
            position: "sticky",
            top: 0,
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            zIndex: 100,
          }}
        >
          <div
            className="container"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: 52,
            }}
          >
            <Link
              href="/"
              style={{
                fontWeight: 700,
                fontSize: 15,
                color: "var(--text-primary)",
                textDecoration: "none",
                letterSpacing: "-0.01em",
              }}
            >
              SHUD<span style={{ color: "var(--accent)" }}>.</span>
            </Link>

            <nav style={{ display: "flex", gap: 24, alignItems: "center" }}>
              <Link href="/" className="nav-link">홈</Link>
              <Link href="/blog" className="nav-link">블로그</Link>
              <Link href="/about" className="nav-link">소개</Link>
            </nav>
          </div>
        </header>

        <main style={{ flex: 1 }}>{children}</main>

        <footer
          style={{
            borderTop: "1px solid var(--border)",
            padding: "28px 0",
            marginTop: 80,
          }}
        >
          <div
            className="container"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
              © 2026 SHUD
            </span>
            <div style={{ display: "flex", gap: 20 }}>
              <Link href="/privacy" style={{ fontSize: 13, color: "var(--text-tertiary)", textDecoration: "none" }}>
                개인정보처리방침
              </Link>
              <Link href="/contact" style={{ fontSize: 13, color: "var(--text-tertiary)", textDecoration: "none" }}>
                연락하기
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
