import Link from 'next/link';
import { GUIDES } from '@/lib/guides-data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TFT 공략 가이드 | 롤토체스 전략 완전 정복',
  description: '롤토체스(TFT) 시즌 17 공략 가이드 모음. 초보 가이드부터 고급 전략까지 — 경제 운영, 아이템 조합, 증강체 선택, 포지셔닝까지 한 번에 정리했습니다.',
};

const CATEGORY_COLORS: Record<string, string> = {
  '기초': '#4AE890',
  '전략': '#4A9EE8',
  '아이템': '#E8A454',
  '심화': '#C060F0',
};

export default function GuidesPage() {
  const categories = ['기초', '전략', '아이템', '심화'] as const;

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, fontWeight: 700, color: 'var(--gold-2)', marginBottom: 8 }}>
          공략 가이드
        </h1>
        <p style={{ color: 'var(--muted)', fontFamily: "'Noto Sans KR',sans-serif", fontSize: 15, marginBottom: 36 }}>
          TFT 시즌 17 — 초보부터 고수까지, 실력 향상을 위한 전략 가이드
        </p>

        {categories.map(cat => {
          const guides = GUIDES.filter(g => g.category === cat);
          if (!guides.length) return null;
          const color = CATEGORY_COLORS[cat];
          return (
            <div key={cat} style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{
                  fontFamily: "'Bebas Neue',sans-serif", fontSize: 13, fontWeight: 700,
                  color, background: `${color}22`, border: `1px solid ${color}55`,
                  borderRadius: 3, padding: '3px 10px', letterSpacing: '0.08em',
                }}>{cat}</span>
                <span style={{ color: 'var(--muted)', fontFamily: "'Noto Sans KR',sans-serif", fontSize: 13 }}>
                  {guides.length}개 가이드
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {guides.map(guide => (
                  <Link key={guide.slug} href={`/guides/${guide.slug}`} style={{ textDecoration: 'none' }}>
                    <div className="guide-card" style={{
                      background: 'var(--navy-2)',
                      border: '1px solid var(--border)',
                      borderTop: `2px solid ${color}`,
                      borderRadius: 6,
                      padding: '16px 18px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <h2 style={{
                          fontFamily: "'Noto Sans KR',sans-serif", fontSize: 14, fontWeight: 700,
                          color: 'var(--gold-2)', margin: 0, lineHeight: 1.4, flex: 1,
                        }}>
                          {guide.title}
                        </h2>
                      </div>
                      <p style={{
                        fontFamily: "'Noto Sans KR',sans-serif", fontSize: 12,
                        color: 'var(--muted)', margin: '0 0 12px', lineHeight: 1.6,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {guide.description}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{
                          fontFamily: "'Noto Sans KR',sans-serif", fontSize: 11,
                          color: 'var(--muted)',
                        }}>
                          읽는 시간 {guide.readTime}분
                        </span>
                        <span style={{
                          fontFamily: "'Bebas Neue',sans-serif", fontSize: 12,
                          color, letterSpacing: '0.05em',
                        }}>
                          읽기 →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
