import { notFound } from 'next/navigation';
import Link from 'next/link';
import { GUIDES } from '@/lib/guides-data';
import type { Metadata } from 'next';

export function generateStaticParams() {
  return GUIDES.map(g => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = GUIDES.find(g => g.slug === slug);
  if (!guide) return {};
  return {
    title: `${guide.title} | TFT 공략`,
    description: guide.description,
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `https://tftchess.com/guides/${guide.slug}`,
    },
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  '기초': '#4AE890',
  '전략': '#4A9EE8',
  '아이템': '#E8A454',
  '심화': '#C060F0',
};

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = GUIDES.find(g => g.slug === slug);
  if (!guide) notFound();

  const color = CATEGORY_COLORS[guide.category];
  const idx = GUIDES.indexOf(guide);
  const prev = idx > 0 ? GUIDES[idx - 1] : null;
  const next = idx < GUIDES.length - 1 ? GUIDES[idx + 1] : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    url: `https://tftchess.com/guides/${guide.slug}`,
    publisher: {
      '@type': 'Organization',
      name: 'TFT.GG',
      url: 'https://tftchess.com',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div style={{ padding: '40px 0 80px' }}>
        <div className="container" style={{ maxWidth: 760 }}>
          {/* 브레드크럼 */}
          <nav style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 24, fontFamily: "'Noto Sans KR',sans-serif", fontSize: 13, color: 'var(--muted)' }}>
            <Link href="/" style={{ color: 'var(--muted)', textDecoration: 'none' }}>홈</Link>
            <span>/</span>
            <Link href="/guides" style={{ color: 'var(--muted)', textDecoration: 'none' }}>공략 가이드</Link>
            <span>/</span>
            <span style={{ color: 'var(--gold-2)' }}>{guide.category}</span>
          </nav>

          {/* 헤더 */}
          <div style={{ marginBottom: 32 }}>
            <span style={{
              fontFamily: "'Bebas Neue',sans-serif", fontSize: 12, fontWeight: 700,
              color, background: `${color}22`, border: `1px solid ${color}55`,
              borderRadius: 3, padding: '3px 10px', letterSpacing: '0.08em',
              display: 'inline-block', marginBottom: 12,
            }}>{guide.category}</span>
            <h1 style={{
              fontFamily: "'Noto Sans KR',sans-serif", fontSize: 24, fontWeight: 700,
              color: 'var(--gold-2)', margin: '0 0 12px', lineHeight: 1.4,
            }}>
              {guide.title}
            </h1>
            <p style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 14, color: 'var(--muted)', margin: '0 0 12px' }}>
              {guide.description}
            </p>
            <div style={{ display: 'flex', gap: 16, fontFamily: "'Noto Sans KR',sans-serif", fontSize: 12, color: 'var(--muted)' }}>
              <span>읽는 시간 약 {guide.readTime}분</span>
            </div>
          </div>

          {/* 구분선 */}
          <div style={{ borderTop: '1px solid var(--border)', marginBottom: 32 }} />

          {/* 본문 */}
          <div
            className="guide-content"
            dangerouslySetInnerHTML={{ __html: guide.content }}
          />

          {/* 구분선 */}
          <div style={{ borderTop: '1px solid var(--border)', marginTop: 48, marginBottom: 32 }} />

          {/* 이전/다음 네비게이션 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            {prev ? (
              <Link href={`/guides/${prev.slug}`} style={{ textDecoration: 'none', flex: 1 }}>
                <div style={{
                  background: 'var(--navy-2)', border: '1px solid var(--border)',
                  borderRadius: 6, padding: '14px 16px',
                }}>
                  <div style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>← 이전 가이드</div>
                  <div style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 13, fontWeight: 600, color: 'var(--gold-2)' }}>{prev.title}</div>
                </div>
              </Link>
            ) : <div style={{ flex: 1 }} />}
            {next ? (
              <Link href={`/guides/${next.slug}`} style={{ textDecoration: 'none', flex: 1 }}>
                <div style={{
                  background: 'var(--navy-2)', border: '1px solid var(--border)',
                  borderRadius: 6, padding: '14px 16px', textAlign: 'right',
                }}>
                  <div style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>다음 가이드 →</div>
                  <div style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 13, fontWeight: 600, color: 'var(--gold-2)' }}>{next.title}</div>
                </div>
              </Link>
            ) : <div style={{ flex: 1 }} />}
          </div>

          {/* 전체 가이드 목록으로 */}
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Link href="/guides" style={{
              fontFamily: "'Noto Sans KR',sans-serif", fontSize: 13,
              color: 'var(--muted)', textDecoration: 'none',
            }}>
              ← 전체 가이드 목록
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
