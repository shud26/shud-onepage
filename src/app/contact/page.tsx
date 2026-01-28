import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '문의 | SHUD Crypto Tools',
  description: 'SHUD Crypto Tools 문의. 버그 신고, 기능 제안, 협업 문의.',
  alternates: {
    canonical: 'https://tftchess.com/contact',
  },
};

export default function ContactPage() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#1F1F23] bg-[#0A0A0B]/90 backdrop-blur-sm">
        <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-lg font-semibold tracking-[4px] font-mono-data hover:text-[#FF5C00] transition-colors">SHUD</Link>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C00]"></span>
          <span className="text-[13px] text-[#6B6B70]">문의</span>
        </nav>
      </header>

      <main className="min-h-screen pb-20">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <Link href="/" className="text-[#FF5C00] hover:text-[#FF8A4C] text-sm mb-8 inline-block transition-colors">
            &larr; 홈으로
          </Link>

          <h1 className="font-display text-3xl md:text-4xl text-white tracking-tight leading-tight mb-10">
            문의
          </h1>

          <div className="space-y-8 text-[#ADADB0] text-[14px] leading-relaxed">
            <p>
              SHUD Crypto Tools에 대한 문의, 버그 신고, 기능 제안 등은 아래 채널을 통해 연락해 주세요.
            </p>

            <div className="grid gap-4">
              <a
                href="https://github.com/shud26/shud-onepage/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#111113] border border-[#1F1F23] rounded-xl p-6 hover:border-[#FF5C00] transition-colors block group"
              >
                <h2 className="text-white text-lg font-semibold mb-2 group-hover:text-[#FF5C00] transition-colors">
                  GitHub Issues
                </h2>
                <p className="text-[13px] text-[#8B8B90] mb-3">
                  버그 신고, 기능 제안, 개선 요청은 GitHub Issues에 남겨주세요.
                </p>
                <span className="text-[12px] text-[#FF5C00] font-mono-data">github.com/shud26/shud-onepage/issues</span>
              </a>

              <a
                href="https://github.com/shud26"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#111113] border border-[#1F1F23] rounded-xl p-6 hover:border-[#FF5C00] transition-colors block group"
              >
                <h2 className="text-white text-lg font-semibold mb-2 group-hover:text-[#FF5C00] transition-colors">
                  GitHub Profile
                </h2>
                <p className="text-[13px] text-[#8B8B90] mb-3">
                  프로젝트 전체 코드와 다른 프로젝트를 확인할 수 있습니다.
                </p>
                <span className="text-[12px] text-[#FF5C00] font-mono-data">github.com/shud26</span>
              </a>
            </div>

            <section>
              <h2 className="text-white text-lg font-semibold mb-3">문의 가능 내용</h2>
              <ul className="space-y-2 text-[#8B8B90]">
                <li className="flex items-start gap-2">
                  <span className="text-[#FF5C00] mt-0.5">&#8226;</span>
                  <span>사이트 버그 또는 오류 신고</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF5C00] mt-0.5">&#8226;</span>
                  <span>새로운 기능 제안</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF5C00] mt-0.5">&#8226;</span>
                  <span>데이터 정확성 관련 제보</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF5C00] mt-0.5">&#8226;</span>
                  <span>협업 및 기타 문의</span>
                </li>
              </ul>
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
          <Link href="/about" className="hover:text-[#FF5C00] transition-colors">소개</Link>
        </div>
      </footer>
    </>
  );
}
