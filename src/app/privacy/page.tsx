import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '개인정보처리방침 | SHUD Crypto Tools',
  description: 'SHUD Crypto Tools 개인정보처리방침. 수집하는 정보, 이용 목적, 제3자 서비스에 대한 안내.',
  alternates: {
    canonical: 'https://tftchess.com/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#1F1F23] bg-[#0A0A0B]/90 backdrop-blur-sm">
        <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-lg font-semibold tracking-[4px] font-mono-data hover:text-[#FF5C00] transition-colors">SHUD</Link>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C00]"></span>
          <span className="text-[13px] text-[#6B6B70]">개인정보처리방침</span>
        </nav>
      </header>

      <main className="min-h-screen pb-20">
        <article className="max-w-3xl mx-auto px-4 py-12">
          <Link href="/" className="text-[#FF5C00] hover:text-[#FF8A4C] text-sm mb-8 inline-block transition-colors">
            &larr; 홈으로
          </Link>

          <h1 className="font-display text-3xl md:text-4xl text-white tracking-tight leading-tight mb-8">
            개인정보처리방침
          </h1>
          <p className="text-[#6B6B70] text-[13px] font-mono-data mb-10">최종 수정일: 2026-01-28</p>

          <div className="space-y-8 text-[#ADADB0] text-[14px] leading-relaxed">
            <section>
              <h2 className="text-white text-lg font-semibold mb-3">1. 수집하는 정보</h2>
              <p>SHUD Crypto Tools(이하 &quot;본 사이트&quot;)는 서비스 제공을 위해 최소한의 정보를 수집합니다.</p>
              <ul className="list-disc list-inside mt-3 space-y-1 text-[#8B8B90]">
                <li>자동 수집 정보: IP 주소, 브라우저 유형, 방문 페이지, 접속 시간</li>
                <li>쿠키: 사이트 이용 분석 및 광고 제공을 위한 쿠키</li>
              </ul>
              <p className="mt-3">본 사이트는 회원가입을 요구하지 않으며, 개인 식별 정보(이름, 이메일 등)를 별도로 수집하지 않습니다.</p>
            </section>

            <section>
              <h2 className="text-white text-lg font-semibold mb-3">2. 정보 이용 목적</h2>
              <ul className="list-disc list-inside space-y-1 text-[#8B8B90]">
                <li>서비스 제공 및 개선</li>
                <li>사이트 이용 통계 분석</li>
                <li>광고 게재 (Google AdSense)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white text-lg font-semibold mb-3">3. 제3자 서비스</h2>
              <p>본 사이트는 다음의 제3자 서비스를 이용합니다.</p>
              <ul className="list-disc list-inside mt-3 space-y-2 text-[#8B8B90]">
                <li>
                  <span className="text-white">Google AdSense</span> - 광고 제공. Google의 쿠키를 사용하여 사용자의 관심사에 기반한 광고를 표시할 수 있습니다.
                  자세한 내용은{' '}
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#FF5C00] hover:text-[#FF8A4C]">
                    Google 개인정보처리방침
                  </a>을 참고하세요.
                </li>
                <li>
                  <span className="text-white">Supabase</span> - 데이터베이스 서비스. 블로그 글, 에어드랍 정보 등 사이트 데이터 저장에 사용됩니다.
                </li>
                <li>
                  <span className="text-white">Vercel</span> - 웹사이트 호스팅. 서버 로그에 접속 정보가 기록될 수 있습니다.
                </li>
                <li>
                  <span className="text-white">CoinGecko, Binance 등 거래소 API</span> - 실시간 암호화폐 가격 정보 조회에 사용됩니다.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-white text-lg font-semibold mb-3">4. 쿠키 관리</h2>
              <p>
                사용자는 브라우저 설정을 통해 쿠키 수집을 거부할 수 있습니다.
                다만, 쿠키를 거부할 경우 일부 서비스 이용에 제한이 있을 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-white text-lg font-semibold mb-3">5. 정보 보호</h2>
              <p>
                본 사이트는 HTTPS 암호화 통신을 사용하며, 수집된 정보의 안전한 관리를 위해 노력합니다.
              </p>
            </section>

            <section>
              <h2 className="text-white text-lg font-semibold mb-3">6. 방침 변경</h2>
              <p>
                본 개인정보처리방침은 변경될 수 있으며, 변경 시 본 페이지에 게시합니다.
              </p>
            </section>

            <section>
              <h2 className="text-white text-lg font-semibold mb-3">7. 문의</h2>
              <p>
                개인정보 관련 문의는{' '}
                <a href="https://github.com/shud26" target="_blank" rel="noopener noreferrer" className="text-[#FF5C00] hover:text-[#FF8A4C]">
                  GitHub
                </a>
                를 통해 연락해 주세요.
              </p>
            </section>
          </div>
        </article>
      </main>

      <footer className="border-t border-[#1F1F23] bg-[#0A0A0B]">
        <div className="max-w-7xl mx-auto px-4 py-8 flex items-center justify-center gap-2 text-[#6B6B70] text-[11px] font-mono-data tracking-wide">
          <Link href="/" className="hover:text-[#FF5C00] transition-colors">홈</Link>
          <span className="w-1 h-1 rounded-full bg-[#2A2A2E]"></span>
          <Link href="/about" className="hover:text-[#FF5C00] transition-colors">소개</Link>
          <span className="w-1 h-1 rounded-full bg-[#2A2A2E]"></span>
          <Link href="/contact" className="hover:text-[#FF5C00] transition-colors">문의</Link>
        </div>
      </footer>
    </>
  );
}
