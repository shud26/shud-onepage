'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { guides, categories } from '@/data/guides';

export default function GuidesPageClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredGuides = useMemo(() => {
    if (selectedCategory === 'all') return guides;
    return guides.filter(g => g.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#1F1F23] bg-[#0A0A0B]/90 backdrop-blur-sm">
        <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-lg font-semibold tracking-[4px] font-mono-data hover:text-[#FF5C00] transition-colors">SHUD</Link>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C00]"></span>
          <span className="text-[13px] text-[#6B6B70]">가이드</span>
        </nav>
      </header>

      <main className="min-h-screen pb-20">
        <div className="max-w-5xl mx-auto px-4 py-12">
          {/* Title */}
          <div className="mb-8">
            <h1 className="font-display text-4xl md:text-5xl text-white tracking-tight mb-3">
              암호화폐 가이드
            </h1>
            <p className="text-[#8B8B90] text-base">
              코인 투자에 필요한 모든 정보를 쉽게 설명합니다
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-[#FF5C00] text-white'
                  : 'bg-[#1A1A1D] text-[#8B8B90] hover:text-white'
              }`}
            >
              전체 ({guides.length})
            </button>
            {Object.entries(categories).map(([key, { label, color }]) => {
              const count = guides.filter(g => g.category === key).length;
              if (count === 0) return null;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                    selectedCategory === key
                      ? 'text-white'
                      : 'bg-[#1A1A1D] text-[#8B8B90] hover:text-white'
                  }`}
                  style={selectedCategory === key ? { backgroundColor: color } : {}}
                >
                  {label} ({count})
                </button>
              );
            })}
          </div>

          {/* Guides Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {filteredGuides.map(guide => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                className="block bg-[#111113] border border-[#1F1F23] rounded-xl p-6 hover:border-[#FF5C00] transition-colors group"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="text-[10px] font-medium px-2.5 py-1 rounded-full"
                    style={{
                      backgroundColor: `${categories[guide.category]?.color}15`,
                      color: categories[guide.category]?.color,
                    }}
                  >
                    {categories[guide.category]?.label}
                  </span>
                  <span className="text-[11px] text-[#6B6B70]">{guide.readTime}분</span>
                </div>
                <h2 className="text-lg font-semibold text-white group-hover:text-[#FF5C00] transition-colors mb-2 line-clamp-2">
                  {guide.title}
                </h2>
                <p className="text-[13px] text-[#ADADB0] leading-relaxed line-clamp-2">
                  {guide.description}
                </p>
              </Link>
            ))}
          </div>

          {/* SEO Content */}
          <div className="mt-16 pt-8 border-t border-[#1F1F23]">
            <h2 className="text-xl font-semibold text-white mb-4">암호화폐 투자, 어디서부터 시작할까?</h2>
            <div className="text-[14px] text-[#ADADB0] leading-relaxed space-y-4">
              <p>
                암호화폐 시장은 빠르게 성장하고 있지만, 초보자에게는 어려운 용어와 복잡한 개념이 많습니다.
                SHUD 가이드는 비트코인, 이더리움 같은 기본 개념부터 DeFi, NFT, 스테이킹 같은 고급 주제까지
                누구나 이해할 수 있도록 쉽게 설명합니다.
              </p>
              <p>
                특히 한국 투자자를 위해 김치프리미엄, 국내 거래소 비교, 암호화폐 세금 가이드 등
                실질적으로 필요한 정보를 담았습니다. 투자 전 충분히 공부하고, 본인이 이해한 만큼만 투자하세요.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1F1F23] bg-[#0A0A0B]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-wrap items-center justify-center gap-4 text-[#6B6B70] text-[11px] font-mono-data tracking-wide">
            <Link href="/" className="hover:text-[#FF5C00] transition-colors">홈</Link>
            <span className="w-1 h-1 rounded-full bg-[#2A2A2E]"></span>
            <Link href="/blog" className="hover:text-[#FF5C00] transition-colors">블로그</Link>
            <span className="w-1 h-1 rounded-full bg-[#2A2A2E]"></span>
            <Link href="/glossary" className="hover:text-[#FF5C00] transition-colors">용어사전</Link>
            <span className="w-1 h-1 rounded-full bg-[#2A2A2E]"></span>
            <Link href="/about" className="hover:text-[#FF5C00] transition-colors">소개</Link>
            <span className="w-1 h-1 rounded-full bg-[#2A2A2E]"></span>
            <Link href="/privacy" className="hover:text-[#FF5C00] transition-colors">개인정보처리방침</Link>
          </div>
          <p className="text-center text-[#4A4A4E] text-[10px] mt-4">
            투자 결정은 본인의 판단에 따라 신중하게 하세요. 이 사이트는 투자 조언을 제공하지 않습니다.
          </p>
        </div>
      </footer>
    </>
  );
}
