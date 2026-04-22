import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '연락하기 | TFT.GG',
  description: 'TFT.GG 문의, 피드백, 오류 제보. 콘텐츠 관련 문의는 이메일로 연락해주세요.',
  alternates: { canonical: 'https://tftchess.com/contact' },
};

export default function ContactPage() {
  return (
    <div style={{ padding: '48px 0 80px' }}>
      <div className="container" style={{ maxWidth: 600 }}>
        <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: 'var(--gold-2)', marginBottom: 8 }}>
          연락하기
        </h1>
        <p style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 15, color: 'var(--muted)', marginBottom: 40 }}>
          피드백, 오류 제보, 협업 문의 모두 환영합니다.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* 이메일 */}
          <div style={{
            background: 'var(--navy-2)',
            border: '1px solid var(--border)',
            borderLeft: '3px solid var(--gold)',
            borderRadius: 6,
            padding: '20px 20px',
          }}>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 15, fontWeight: 700, color: 'var(--gold-2)', marginBottom: 6, letterSpacing: '0.05em' }}>
              이메일
            </div>
            <p style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>
              콘텐츠 오류 제보, 공략 수정 요청, 협업 및 광고 문의
            </p>
            <a href="mailto:superdreamer768@gmail.com" style={{
              fontFamily: "'Noto Sans KR',sans-serif", fontSize: 14, fontWeight: 600,
              color: 'var(--gold)', textDecoration: 'none',
            }}>
              superdreamer768@gmail.com
            </a>
          </div>

          {/* GitHub */}
          <a
            href="https://github.com/shud26/shud-onepage/issues"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <div style={{
              background: 'var(--navy-2)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: '20px 20px',
            }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 15, fontWeight: 700, color: 'var(--gold-2)', marginBottom: 6, letterSpacing: '0.05em' }}>
                GitHub Issues
              </div>
              <p style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>
                버그 신고, 기능 제안, 데이터 오류 제보
              </p>
              <span style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 12, color: 'var(--muted)', opacity: 0.7 }}>
                github.com/shud26/shud-onepage/issues →
              </span>
            </div>
          </a>
        </div>

        <div style={{ marginTop: 40 }}>
          <h2 style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 15, fontWeight: 700, color: 'var(--gold-2)', marginBottom: 12 }}>
            문의 가능한 내용
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              '챔피언/아이템/덱 데이터 오류 제보',
              '공략 가이드 내용 수정 요청',
              '신규 콘텐츠 제안',
              '협업 및 광고 문의',
              '기타 피드백',
            ].map(item => (
              <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ color: 'var(--gold)', fontFamily: "'Bebas Neue',sans-serif", fontSize: 14 }}>—</span>
                <span style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 14, color: '#c8bfa8' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
