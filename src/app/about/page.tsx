import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '소개 | SHUD Crypto Tools',
  description: 'SHUD Crypto Tools 소개. 바이브 코딩으로 만드는 무료 크립토 도구 모음.',
  alternates: {
    canonical: 'https://tftchess.com/about',
  },
};

export default function AboutPage() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#1F1F23] bg-[#0A0A0B]/90 backdrop-blur-sm">
        <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-lg font-semibold tracking-[4px] font-mono-data hover:text-[#FF5C00] transition-colors">SHUD</Link>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C00]"></span>
          <span className="text-[13px] text-[#6B6B70]">소개</span>
        </nav>
      </header>

      <main className="min-h-screen pb-20">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <Link href="/" className="text-[#FF5C00] hover:text-[#FF8A4C] text-sm mb-8 inline-block transition-colors">
            &larr; 홈으로
          </Link>

          <h1 className="font-display text-3xl md:text-4xl text-white tracking-tight leading-tight mb-10">
            SHUD Crypto Tools
          </h1>

          <div className="space-y-8 text-[#ADADB0] text-[14px] leading-relaxed">
            <section>
              <h2 className="text-white text-lg font-semibold mb-3">무료 크립토 도구 모음</h2>
              <p>
                SHUD Crypto Tools는 암호화폐 투자에 필요한 다양한 도구를 무료로 제공하는 사이트입니다.
                실시간 시세 확인부터 고래 지갑 추적, 김치 프리미엄 모니터링까지 한 곳에서 확인할 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-white text-lg font-semibold mb-3">제공 기능</h2>
              <div className="grid gap-4">
                {[
                  { title: '김치 프리미엄 모니터', desc: '한국 거래소와 해외 거래소 간 가격 차이를 실시간으로 확인합니다.' },
                  { title: '고래 지갑 추적', desc: '대규모 암호화폐 보유자(고래)의 지갑 활동을 모니터링합니다.' },
                  { title: '실시간 시세', desc: 'BTC, ETH, SOL 등 주요 코인의 실시간 가격을 제공합니다.' },
                  { title: '에어드랍 트래커', desc: '에어드랍 일정과 태스크를 관리하고 비용을 추적합니다.' },
                  { title: '코인 리서치 노트', desc: '코인별 분석, 투자 의견, 프로젝트 정보를 정리합니다.' },
                  { title: '개발 블로그', desc: '바이브 코딩으로 도구를 만드는 과정을 기록합니다.' },
                ].map((item) => (
                  <div key={item.title} className="bg-[#111113] border border-[#1F1F23] rounded-xl p-4">
                    <h3 className="text-white text-sm font-semibold mb-1">{item.title}</h3>
                    <p className="text-[13px] text-[#8B8B90]">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-white text-lg font-semibold mb-3">만든 사람</h2>
              <p>
                코딩 입문자가 Claude Code(바이브 코딩)를 활용하여 만들고 있습니다.
                2026년 1월부터 매일 개발하며 성장 중입니다.
              </p>
              <div className="mt-4 flex gap-3">
                <a
                  href="https://github.com/shud26"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-lg text-sm font-medium border border-[#1F1F23] hover:bg-[#1A1A1D] text-[#8B8B90] hover:text-white transition-colors"
                >
                  GitHub
                </a>
                <Link
                  href="/blog"
                  className="px-4 py-2.5 rounded-lg text-sm font-medium bg-[#FF5C00] hover:bg-[#FF8A4C] text-white transition-colors"
                >
                  개발 블로그
                </Link>
              </div>
            </section>

            <section>
              <h2 className="text-white text-lg font-semibold mb-3">기술 스택</h2>
              <div className="flex flex-wrap gap-2">
                {['Next.js', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Vercel', 'Claude Code'].map((tech) => (
                  <span
                    key={tech}
                    className="text-[12px] font-medium px-3 py-1.5 rounded-full bg-[#FF5C00]/10 text-[#FF5C00]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#1F1F23] bg-[#0A0A0B]">
        <div className="max-w-7xl mx-auto px-4 py-8 flex items-center justify-center gap-2 text-[#6B6B70] text-[11px] font-mono-data tracking-wide">
          <Link href="/" className="hover:text-[#FF5C00] transition-colors">홈</Link>
          <span className="w-1 h-1 rounded-full bg-[#2A2A2E]"></span>
          <Link href="/privacy" className="hover:text-[#FF5C00] transition-colors">개인정보처리방침</Link>
          <span className="w-1 h-1 rounded-full bg-[#2A2A2E]"></span>
          <Link href="/contact" className="hover:text-[#FF5C00] transition-colors">문의</Link>
        </div>
      </footer>
    </>
  );
}
