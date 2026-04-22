'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./globals.css";

const TABS = [
  { href: '/',           label: '홈'       },
  { href: '/champions',  label: '챔피언'   },
  { href: '/decks',      label: '덱 추천'  },
  { href: '/meta',       label: '메타 통계' },
  { href: '/items',      label: '아이템'   },
  { href: '/guides',     label: '공략 가이드' },
  { href: '/summoner',   label: '소환사 검색' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <html lang="ko">
      <head>
        <title>TFT.GG — Season 17 Arcane Depths</title>
        <meta name="description" content="롤토체스 시즌 17 아케인 심연 — 챔피언 도감, 덱 추천, 메타 통계, 아이템 조합기" />
        <meta name="robots" content="index, follow" />
        <meta name="google-site-verification" content="QMhQF2aEFB6DI0kK-DEBDwCjfHRHb3YtkUzVx4x2_cc" />
      </head>
      <body>
        {/* 네비게이션 */}
        <nav className="tft-nav">
          <div className="container tft-nav-inner">
            <Link href="/" className="tft-logo">
              <div className="tft-logo-hex">T</div>
              <span className="tft-logo-text">
                TFT<span className="gg">.GG</span>
              </span>
              <span className="tft-logo-badge">S17</span>
            </Link>

            <div className="tft-tabs">
              {TABS.map(t => {
                const active = t.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(t.href);
                return (
                  <Link
                    key={t.href}
                    href={t.href}
                    className={`tft-tab ${active ? 'active' : ''}`}
                  >
                    {t.label}
                  </Link>
                );
              })}
            </div>

            <span className="tft-patch">Patch 17.1</span>
          </div>
        </nav>

        <main>{children}</main>

        <footer style={{
          borderTop: '1px solid var(--border)',
          padding: '28px 0',
          marginTop: 80,
        }}>
          <div className="container" style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: 12,
          }}>
            <span style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'Rajdhani, sans-serif' }}>
              © 2026 TFT.GG — 팬 사이트, Riot Games와 무관합니다
            </span>
            <div style={{ display: 'flex', gap: 20 }}>
              <Link href="/privacy" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none' }}>개인정보처리방침</Link>
              <Link href="/contact" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none' }}>연락하기</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
