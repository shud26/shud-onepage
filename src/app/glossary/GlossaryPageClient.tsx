'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { glossaryTerms, categories } from '@/data/glossary';

export default function GlossaryPageClient() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTerms = useMemo(() => {
    let terms = glossaryTerms;

    if (selectedCategory !== 'all') {
      terms = terms.filter(t => t.category === selectedCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      terms = terms.filter(t =>
        t.term.toLowerCase().includes(q) ||
        t.termEn.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q)
      );
    }

    return terms.sort((a, b) => a.term.localeCompare(b.term, 'ko'));
  }, [search, selectedCategory]);

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#1F1F23] bg-[#0A0A0B]/90 backdrop-blur-sm">
        <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-lg font-semibold tracking-[4px] font-mono-data hover:text-[#FF5C00] transition-colors">SHUD</Link>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C00]"></span>
          <span className="text-[13px] text-[#6B6B70]">코인 용어 사전</span>
        </nav>
      </header>

      <main className="min-h-screen pb-20">
        <div className="max-w-5xl mx-auto px-4 py-12">
          {/* Title */}
          <div className="mb-8">
            <h1 className="font-display text-4xl md:text-5xl text-white tracking-tight mb-3">
              코인 용어 사전
            </h1>
            <p className="text-[#8B8B90] text-base">
              암호화폐 핵심 용어 {glossaryTerms.length}개를 쉽게 설명합니다
            </p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="용어 검색... (예: 스테이킹, DeFi, 김치프리미엄)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111113] border border-[#1F1F23] rounded-xl px-5 py-3.5 text-[14px] placeholder:text-[#4A4A4E] focus:outline-none focus:border-[#FF5C00] transition-colors"
            />
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
              전체 ({glossaryTerms.length})
            </button>
            {Object.entries(categories).map(([key, { label }]) => {
              const count = glossaryTerms.filter(t => t.category === key).length;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                    selectedCategory === key
                      ? 'bg-[#FF5C00] text-white'
                      : 'bg-[#1A1A1D] text-[#8B8B90] hover:text-white'
                  }`}
                >
                  {label} ({count})
                </button>
              );
            })}
          </div>

          {/* Terms List */}
          {filteredTerms.length === 0 ? (
            <div className="text-center py-16 text-[#6B6B70]">
              <p className="text-lg mb-2">검색 결과가 없습니다</p>
              <p className="text-sm">다른 키워드로 검색해보세요</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTerms.map(term => (
                <Link
                  key={term.slug}
                  href={`/glossary/${term.slug}`}
                  className="block bg-[#111113] border border-[#1F1F23] rounded-xl p-5 hover:border-[#FF5C00] transition-colors group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-white font-semibold group-hover:text-[#FF5C00] transition-colors">
                          {term.term}
                        </h2>
                        <span className="text-[11px] text-[#6B6B70] font-mono-data">{term.termEn}</span>
                      </div>
                      <p className="text-[13px] text-[#ADADB0] leading-relaxed">
                        {term.definition}
                      </p>
                    </div>
                    <span
                      className="text-[10px] font-medium px-2.5 py-1 rounded-full shrink-0"
                      style={{
                        backgroundColor: `${categories[term.category]?.color}15`,
                        color: categories[term.category]?.color,
                      }}
                    >
                      {categories[term.category]?.label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1F1F23] bg-[#0A0A0B]">
        <div className="max-w-7xl mx-auto px-4 py-8 flex items-center justify-center gap-2 text-[#6B6B70] text-[11px] font-mono-data tracking-wide">
          <Link href="/" className="hover:text-[#FF5C00] transition-colors">홈</Link>
          <span className="w-1 h-1 rounded-full bg-[#2A2A2E]"></span>
          <Link href="/blog" className="hover:text-[#FF5C00] transition-colors">블로그</Link>
          <span className="w-1 h-1 rounded-full bg-[#2A2A2E]"></span>
          <span>Built with Claude Code</span>
        </div>
      </footer>
    </>
  );
}
