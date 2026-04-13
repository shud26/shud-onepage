import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '개인정보처리방침 | SHUD',
  description: 'SHUD 개인정보처리방침. 수집하는 정보, 이용 목적, 제3자 서비스에 대한 안내.',
  alternates: {
    canonical: 'https://tftchess.com/privacy',
  },
};

const sectionStyle = {
  marginBottom: 32,
};

const h2Style = {
  fontSize: 15,
  fontWeight: 600,
  color: 'var(--text-primary)',
  marginBottom: 10,
} as const;

const pStyle = {
  fontSize: 14,
  color: 'var(--text-secondary)',
  lineHeight: 1.75,
} as const;

const liStyle = {
  fontSize: 14,
  color: 'var(--text-secondary)',
  lineHeight: 1.75,
  marginBottom: 6,
  paddingLeft: 16,
  position: 'relative' as const,
};

export default function PrivacyPage() {
  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
      <Link
        href="/"
        style={{ fontSize: 14, color: 'var(--text-tertiary)', textDecoration: 'none', display: 'inline-block', marginBottom: 32 }}
      >
        ← 홈으로
      </Link>

      <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: 8 }}>
        개인정보처리방침
      </h1>
      <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 48 }}>최종 수정일: 2026-01-28</p>

      <div>
        <div style={sectionStyle}>
          <h2 style={h2Style}>1. 수집하는 정보</h2>
          <p style={pStyle}>본 사이트는 서비스 제공을 위해 최소한의 정보를 수집합니다.</p>
          <ul style={{ listStyle: 'none', padding: 0, marginTop: 10 }}>
            {[
              '자동 수집 정보: IP 주소, 브라우저 유형, 방문 페이지, 접속 시간',
              '쿠키: 사이트 이용 분석 및 광고 제공을 위한 쿠키',
            ].map((item) => (
              <li key={item} style={liStyle}>
                <span style={{ position: 'absolute', left: 0, color: 'var(--accent)' }}>—</span>
                {item}
              </li>
            ))}
          </ul>
          <p style={{ ...pStyle, marginTop: 10 }}>
            본 사이트는 회원가입을 요구하지 않으며, 개인 식별 정보(이름, 이메일 등)를 별도로 수집하지 않습니다.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>2. 정보 이용 목적</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {['서비스 제공 및 개선', '사이트 이용 통계 분석', '광고 게재 (Google AdSense)'].map((item) => (
              <li key={item} style={liStyle}>
                <span style={{ position: 'absolute', left: 0, color: 'var(--accent)' }}>—</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>3. 제3자 서비스</h2>
          <p style={pStyle}>본 사이트는 다음의 제3자 서비스를 이용합니다.</p>
          <ul style={{ listStyle: 'none', padding: 0, marginTop: 10 }}>
            {[
              { name: 'Google AdSense', desc: '광고 제공. Google의 쿠키를 사용하여 관심사 기반 광고를 표시할 수 있습니다.' },
              { name: 'Vercel', desc: '웹사이트 호스팅. 서버 로그에 접속 정보가 기록될 수 있습니다.' },
              { name: 'CoinGecko, Binance 등', desc: '실시간 암호화폐 가격 정보 조회에 사용됩니다.' },
            ].map((item) => (
              <li key={item.name} style={{ ...liStyle, marginBottom: 12 }}>
                <span style={{ position: 'absolute', left: 0, color: 'var(--accent)' }}>—</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</span>
                {' '}— {item.desc}
              </li>
            ))}
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>4. 쿠키 관리</h2>
          <p style={pStyle}>
            사용자는 브라우저 설정을 통해 쿠키 수집을 거부할 수 있습니다.
            다만, 쿠키를 거부할 경우 일부 서비스 이용에 제한이 있을 수 있습니다.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>5. 정보 보호</h2>
          <p style={pStyle}>
            본 사이트는 HTTPS 암호화 통신을 사용하며, 수집된 정보의 안전한 관리를 위해 노력합니다.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>6. 방침 변경</h2>
          <p style={pStyle}>
            본 개인정보처리방침은 변경될 수 있으며, 변경 시 본 페이지에 게시합니다.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>7. 문의</h2>
          <p style={pStyle}>
            개인정보 관련 문의는{' '}
            <a
              href="https://github.com/shud26"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent)', textDecoration: 'none' }}
            >
              GitHub
            </a>
            를 통해 연락해 주세요.
          </p>
        </div>
      </div>
    </div>
  );
}
