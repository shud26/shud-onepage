import type { Metadata } from 'next';
import Link from 'next/link';
import { glossaryTerms, categories, getTermBySlug, getRelatedTerms } from '@/data/glossary';

type Props = {
  params: Promise<{ slug: string }>;
};

// Pre-render all glossary pages at build time
export async function generateStaticParams() {
  return glossaryTerms.map((term) => ({
    slug: term.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const term = getTermBySlug(slug);

  if (!term) {
    return { title: '용어를 찾을 수 없습니다 | SHUD Crypto Tools' };
  }

  const title = `${term.term}이란? (${term.termEn}) | 코인 용어 사전`;
  const description = `${term.term}(${term.termEn}) 뜻: ${term.definition}. ${term.description.slice(0, 100)}...`;
  const url = `https://tftchess.com/glossary/${term.slug}`;

  return {
    title,
    description,
    keywords: `${term.term}, ${term.termEn}, ${term.term} 뜻, ${term.term}이란, 코인 용어, 암호화폐 용어`,
    openGraph: {
      title: `${term.term}이란? | 코인 용어 사전`,
      description: `${term.definition}`,
      type: 'article',
      url,
      locale: 'ko_KR',
      siteName: 'SHUD Crypto Tools',
    },
    twitter: {
      card: 'summary',
      title: `${term.term}이란? (${term.termEn})`,
      description: term.definition,
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function GlossaryTermPage({ params }: Props) {
  const { slug } = await params;
  const term = getTermBySlug(slug);

  if (!term) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B]">
        <div className="text-center">
          <p className="text-2xl mb-4">404</p>
          <p className="text-[#6B6B70] mb-6">용어를 찾을 수 없습니다</p>
          <Link href="/glossary" className="text-[#FF5C00] hover:text-[#FF8A4C] text-sm">
            &larr; 용어 사전으로
          </Link>
        </div>
      </div>
    );
  }

  const relatedTerms = getRelatedTerms(term.relatedTerms);
  const cat = categories[term.category];

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: term.term,
    alternateName: term.termEn,
    description: term.description,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: '코인 용어 사전',
      url: 'https://tftchess.com/glossary',
    },
    url: `https://tftchess.com/glossary/${term.slug}`,
    inLanguage: 'ko',
  };

  // Find prev/next terms alphabetically
  const sorted = [...glossaryTerms].sort((a, b) => a.term.localeCompare(b.term, 'ko'));
  const idx = sorted.findIndex(t => t.slug === term.slug);
  const prevTerm = idx > 0 ? sorted[idx - 1] : null;
  const nextTerm = idx < sorted.length - 1 ? sorted[idx + 1] : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#1F1F23] bg-[#0A0A0B]/90 backdrop-blur-sm">
        <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-lg font-semibold tracking-[4px] font-mono-data hover:text-[#FF5C00] transition-colors">SHUD</Link>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C00]"></span>
          <Link href="/glossary" className="text-[13px] text-[#6B6B70] hover:text-white transition-colors">코인 용어 사전</Link>
        </nav>
      </header>

      <main className="min-h-screen pb-20">
        <article className="max-w-3xl mx-auto px-4 py-12">
          {/* Back link */}
          <Link
            href="/glossary"
            className="text-[#FF5C00] hover:text-[#FF8A4C] text-sm mb-8 inline-block transition-colors"
          >
            &larr; 용어 사전으로
          </Link>

          {/* Term header */}
          <header className="mb-10">
            <span
              className="text-[10px] font-medium px-2.5 py-1 rounded-full inline-block mb-4"
              style={{
                backgroundColor: `${cat?.color}15`,
                color: cat?.color,
              }}
            >
              {cat?.label}
            </span>
            <h1 className="font-display text-3xl md:text-4xl text-white tracking-tight leading-tight mb-2">
              {term.term}
            </h1>
            <p className="text-[#6B6B70] text-[14px] font-mono-data">{term.termEn}</p>
          </header>

          {/* Definition */}
          <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-6 mb-8">
            <p className="text-[11px] text-[#6B6B70] uppercase tracking-wide mb-2">한줄 정의</p>
            <p className="text-lg text-white leading-relaxed">{term.definition}</p>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-white text-lg font-semibold mb-4">상세 설명</h2>
            <p className="text-[#ADADB0] text-[14px] leading-[1.8]">{term.description}</p>
          </div>

          {/* Example */}
          {term.example && (
            <div className="mb-8">
              <h2 className="text-white text-lg font-semibold mb-4">예시</h2>
              <div className="bg-[#FF5C00]/5 border border-[#FF5C00]/20 rounded-xl p-5">
                <p className="text-[14px] text-[#ADADB0] leading-relaxed">{term.example}</p>
              </div>
            </div>
          )}

          {/* Related Terms */}
          {relatedTerms.length > 0 && (
            <div className="mb-8">
              <h2 className="text-white text-lg font-semibold mb-4">관련 용어</h2>
              <div className="flex flex-wrap gap-2">
                {relatedTerms.map(rt => (
                  <Link
                    key={rt.slug}
                    href={`/glossary/${rt.slug}`}
                    className="bg-[#111113] border border-[#1F1F23] rounded-lg px-4 py-2.5 text-sm text-[#ADADB0] hover:border-[#FF5C00] hover:text-[#FF5C00] transition-colors"
                  >
                    {rt.term}
                    <span className="text-[#6B6B70] text-xs ml-1.5">({rt.termEn})</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <footer className="mt-16 pt-8 border-t border-[#1F1F23]">
            <div className="flex justify-between items-center">
              {prevTerm ? (
                <Link
                  href={`/glossary/${prevTerm.slug}`}
                  className="text-[#8B8B90] hover:text-white transition-colors text-sm"
                >
                  &larr; {prevTerm.term}
                </Link>
              ) : (
                <span />
              )}
              {nextTerm ? (
                <Link
                  href={`/glossary/${nextTerm.slug}`}
                  className="text-[#FF5C00] hover:text-[#FF8A4C] transition-colors text-sm"
                >
                  {nextTerm.term} &rarr;
                </Link>
              ) : (
                <span />
              )}
            </div>
          </footer>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1F1F23] bg-[#0A0A0B]">
        <div className="max-w-7xl mx-auto px-4 py-8 flex items-center justify-center gap-2 text-[#6B6B70] text-[11px] font-mono-data tracking-wide">
          <Link href="/" className="hover:text-[#FF5C00] transition-colors">홈</Link>
          <span className="w-1 h-1 rounded-full bg-[#2A2A2E]"></span>
          <Link href="/glossary" className="hover:text-[#FF5C00] transition-colors">용어 사전</Link>
          <span className="w-1 h-1 rounded-full bg-[#2A2A2E]"></span>
          <Link href="/blog" className="hover:text-[#FF5C00] transition-colors">블로그</Link>
        </div>
      </footer>
    </>
  );
}
