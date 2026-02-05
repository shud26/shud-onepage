'use client';

import Link from 'next/link';
import { Guide, categories, guides } from '@/data/guides';

interface Props {
  guide: Guide;
}

export default function GuideDetailClient({ guide }: Props) {
  // Get related guides (same category, excluding current)
  const relatedGuides = guides
    .filter(g => g.category === guide.category && g.slug !== guide.slug)
    .slice(0, 3);

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#1F1F23] bg-[#0A0A0B]/90 backdrop-blur-sm">
        <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-lg font-semibold tracking-[4px] font-mono-data hover:text-[#FF5C00] transition-colors">SHUD</Link>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C00]"></span>
          <Link href="/guides" className="text-[13px] text-[#6B6B70] hover:text-[#FF5C00] transition-colors">가이드</Link>
        </nav>
      </header>

      <main className="min-h-screen pb-20">
        <article className="max-w-3xl mx-auto px-4 py-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[12px] text-[#6B6B70] mb-6">
            <Link href="/" className="hover:text-[#FF5C00]">홈</Link>
            <span>/</span>
            <Link href="/guides" className="hover:text-[#FF5C00]">가이드</Link>
            <span>/</span>
            <span className="text-[#ADADB0]">{categories[guide.category]?.label}</span>
          </div>

          {/* Title */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span
                className="text-[11px] font-medium px-3 py-1 rounded-full"
                style={{
                  backgroundColor: `${categories[guide.category]?.color}15`,
                  color: categories[guide.category]?.color,
                }}
              >
                {categories[guide.category]?.label}
              </span>
              <span className="text-[12px] text-[#6B6B70]">
                {guide.readTime}분 읽기 · {guide.updatedAt} 업데이트
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl text-white tracking-tight leading-tight">
              {guide.title}
            </h1>
            <p className="text-[#8B8B90] text-base mt-4">
              {guide.description}
            </p>
          </div>

          {/* Content */}
          <div
            className="guide-content"
            dangerouslySetInnerHTML={{ __html: guide.content }}
          />

          {/* Related Guides */}
          {relatedGuides.length > 0 && (
            <div className="mt-16 pt-8 border-t border-[#1F1F23]">
              <h3 className="text-lg font-semibold text-white mb-4">관련 가이드</h3>
              <div className="space-y-3">
                {relatedGuides.map(related => (
                  <Link
                    key={related.slug}
                    href={`/guides/${related.slug}`}
                    className="block bg-[#111113] border border-[#1F1F23] rounded-xl p-4 hover:border-[#FF5C00] transition-colors group"
                  >
                    <h4 className="text-white font-medium group-hover:text-[#FF5C00] transition-colors">
                      {related.title}
                    </h4>
                    <p className="text-[12px] text-[#8B8B90] mt-1">{related.readTime}분 읽기</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 p-6 bg-[#111113] border border-[#1F1F23] rounded-xl text-center">
            <p className="text-[#8B8B90] text-sm mb-4">더 많은 가이드를 확인하세요</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/guides"
                className="px-5 py-2.5 bg-[#FF5C00] hover:bg-[#FF8A4C] rounded-lg text-sm font-medium transition-colors"
              >
                전체 가이드 보기
              </Link>
              <Link
                href="/glossary"
                className="px-5 py-2.5 bg-[#1A1A1D] hover:bg-[#2A2A2E] rounded-lg text-sm font-medium transition-colors"
              >
                용어사전 보기
              </Link>
            </div>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1F1F23] bg-[#0A0A0B]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-wrap items-center justify-center gap-4 text-[#6B6B70] text-[11px] font-mono-data tracking-wide">
            <Link href="/" className="hover:text-[#FF5C00] transition-colors">홈</Link>
            <span className="w-1 h-1 rounded-full bg-[#2A2A2E]"></span>
            <Link href="/guides" className="hover:text-[#FF5C00] transition-colors">가이드</Link>
            <span className="w-1 h-1 rounded-full bg-[#2A2A2E]"></span>
            <Link href="/glossary" className="hover:text-[#FF5C00] transition-colors">용어사전</Link>
            <span className="w-1 h-1 rounded-full bg-[#2A2A2E]"></span>
            <Link href="/blog" className="hover:text-[#FF5C00] transition-colors">블로그</Link>
          </div>
          <p className="text-center text-[#4A4A4E] text-[10px] mt-4">
            투자 결정은 본인의 판단에 따라 신중하게 하세요. 이 사이트는 투자 조언을 제공하지 않습니다.
          </p>
        </div>
      </footer>

      <style jsx global>{`
        .guide-content {
          color: #ADADB0;
          font-size: 15px;
          line-height: 1.8;
        }
        .guide-content h2 {
          color: white;
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #1F1F23;
        }
        .guide-content h3 {
          color: white;
          font-size: 1.2rem;
          font-weight: 600;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
        }
        .guide-content h4 {
          color: #E0E0E0;
          font-size: 1rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .guide-content p {
          margin-bottom: 1rem;
        }
        .guide-content ul, .guide-content ol {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        .guide-content li {
          margin-bottom: 0.5rem;
        }
        .guide-content strong {
          color: #FF5C00;
          font-weight: 600;
        }
        .guide-content a {
          color: #FF5C00;
          text-decoration: underline;
        }
        .guide-content a:hover {
          color: #FF8A4C;
        }
        .guide-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
          font-size: 14px;
        }
        .guide-content th {
          background: #1A1A1D;
          color: white;
          padding: 0.75rem;
          text-align: left;
          border: 1px solid #1F1F23;
        }
        .guide-content td {
          padding: 0.75rem;
          border: 1px solid #1F1F23;
        }
        .guide-content em {
          color: #8B8B90;
          font-style: italic;
        }
      `}</style>
    </>
  );
}
