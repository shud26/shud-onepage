import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'TFT.GG 소개 | 롤토체스 시즌 17 정보 사이트',
  description: '한국어 롤토체스(TFT) 정보 사이트 TFT.GG 소개. 챔피언 도감, 덱 추천, 공략 가이드, 메타 통계를 한 곳에서.',
  alternates: { canonical: 'https://tftchess.com/about' },
};

export default function AboutPage() {
  return (
    <div style={{ padding: '48px 0 80px' }}>
      <div className="container" style={{ maxWidth: 720 }}>
        <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: 'var(--gold-2)', marginBottom: 8 }}>
          TFT.GG 소개
        </h1>
        <p style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 15, color: 'var(--muted)', marginBottom: 40 }}>
          한국어 롤토체스 플레이어를 위한 TFT 정보 사이트입니다.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>

          <section>
            <h2 style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--gold-2)', marginBottom: 12 }}>
              이 사이트는 무엇인가요?
            </h2>
            <p style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 15, color: '#c8bfa8', lineHeight: 1.8 }}>
              TFT.GG(tftchess.com)는 팀파이트 택티스(TFT) 한국어 정보 사이트입니다.
              롤토체스를 처음 시작하는 초보부터 랭크를 올리려는 중급자까지,
              실력 향상에 필요한 모든 정보를 한 곳에서 제공합니다.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--gold-2)', marginBottom: 16 }}>
              제공하는 콘텐츠
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { title: '챔피언 도감', desc: 'TFT 시즌 17 전체 챔피언 정보 — 코스트, 특성, 스킬, 추천 아이템' },
                { title: '덱 추천', desc: '시즌 17 메타 최강 덱 10개 — 티어별 분류, 핵심 아이템, 공략 팁 포함' },
                { title: '공략 가이드', desc: '초보부터 고수까지 — 경제 운영, 레벨업 타이밍, 리롤 전략, 포지셔닝 등 10개 가이드' },
                { title: '메타 통계', desc: '증강체 티어리스트, 시너지 분석 — 현재 패치 기준 메타 데이터' },
                { title: '아이템 조합기', desc: 'TFT 전체 아이템 레시피 — 기본 아이템 조합 및 효과 확인' },
              ].map(item => (
                <div key={item.title} style={{
                  padding: '14px 16px',
                  background: 'var(--navy-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                }}>
                  <div style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 14, fontWeight: 700, color: 'var(--gold-2)', marginBottom: 4 }}>
                    {item.title}
                  </div>
                  <div style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 13, color: 'var(--muted)' }}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--gold-2)', marginBottom: 12 }}>
              데이터 출처
            </h2>
            <p style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 15, color: '#c8bfa8', lineHeight: 1.8 }}>
              챔피언 이미지 및 기본 데이터는 Riot Games의 Community Dragon(CDragon) API를 통해 제공됩니다.
              TFT.GG는 Riot Games의 팬 사이트로, Riot Games와 공식적으로 관련이 없습니다.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--gold-2)', marginBottom: 12 }}>
              문의 및 피드백
            </h2>
            <p style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 15, color: '#c8bfa8', lineHeight: 1.8, marginBottom: 16 }}>
              콘텐츠 오류 제보, 개선 제안, 협업 문의는 언제든 환영합니다.
            </p>
            <Link href="/contact" style={{
              display: 'inline-block',
              fontFamily: "'Noto Sans KR',sans-serif", fontSize: 14, fontWeight: 600,
              padding: '10px 20px',
              background: 'var(--gold-3)',
              border: '1px solid var(--border-hover)',
              borderRadius: 4,
              color: 'var(--gold)',
              textDecoration: 'none',
            }}>
              연락하기 →
            </Link>
          </section>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24 }}>
            <p style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
              TFT.GG는 Riot Games의 팬 사이트입니다. Teamfight Tactics 및 League of Legends는 Riot Games, Inc.의 상표입니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
