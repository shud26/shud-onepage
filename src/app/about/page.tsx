import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '소개 | SHUD',
  description: '코딩 입문자가 Claude Code(바이브 코딩)로 크립토 봇을 만들어가는 실전 기록.',
  alternates: {
    canonical: 'https://tftchess.com/about',
  },
};

export default function AboutPage() {
  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
      <Link
        href="/"
        style={{ fontSize: 14, color: 'var(--text-tertiary)', textDecoration: 'none', display: 'inline-block', marginBottom: 32 }}
      >
        ← 홈으로
      </Link>

      <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: 40 }}>
        소개
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        <section>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
            이 사이트는 뭔가요?
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.75 }}>
            코딩 한 줄 못 짜던 사람이 Claude Code(바이브 코딩)로 크립토 봇을 만들어가는 실전 기록입니다.
            성공도, 실패도 솔직하게 씁니다.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
            지금 하고 있는 것들
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { title: '나도봇 (핑퐁 마켓메이킹)', desc: 'BTC·ETH 동시 핑퐁, TimesFM으로 갭 자동 조절' },
              { title: '김프봇 (펀딩비 차익)', desc: 'Hyperliquid + Bybit 델타뉴트럴 펀딩비 스프레드' },
              { title: '블로그 자동화', desc: 'Ollama로 글 초안 생성 → 텔레그램 발송 → 자동 발행' },
              { title: '옵시디언 연동', desc: '봇 성과 보고서를 iCloud 옵시디언에 매일 자동 저장' },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  padding: '14px 16px',
                  borderRadius: 8,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
            만든 사람
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.75 }}>
            2026년 1월부터 매일 바이브코딩 중입니다. 크립토 봇 개발부터 웹 서비스까지, 삽질한 것들을 블로그에 씁니다.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <a
              href="https://github.com/shud26"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 13,
                fontWeight: 500,
                padding: '8px 16px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
              }}
            >
              GitHub
            </a>
            <Link
              href="/blog"
              style={{
                fontSize: 13,
                fontWeight: 500,
                padding: '8px 16px',
                borderRadius: 6,
                background: 'var(--accent)',
                color: '#fff',
                textDecoration: 'none',
              }}
            >
              블로그 보기
            </Link>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
            기술 스택
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['Next.js', 'TypeScript', 'Python', 'Tailwind CSS', 'Vercel', 'Claude Code'].map((tech) => (
              <span key={tech} className="tag">
                {tech}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
