import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "연락하기 | SHUD Crypto",
  description: "SHUD Crypto 블로그 문의. 피드백, 협업 제안, 버그 신고.",
  alternates: { canonical: "https://tftchess.com/contact" },
};

export default function ContactPage() {
  return (
    <div style={{ padding: "48px 0 80px" }}>
      <div className="container">
        <Link
          href="/"
          style={{
            display: "inline-block",
            fontSize: 13,
            color: "var(--text-tertiary)",
            textDecoration: "none",
            marginBottom: 32,
          }}
        >
          ← 홈으로
        </Link>

        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "var(--text-primary)",
            marginBottom: 8,
          }}
        >
          연락하기
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 40 }}>
          피드백, 협업 제안, 버그 신고 모두 환영합니다.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <a
            href="https://github.com/shud26/shud-onepage/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="post-card"
            style={{ display: "block", textDecoration: "none" }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>
              GitHub Issues
            </div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>
              버그 신고, 기능 제안, 개선 요청은 GitHub Issues에 남겨주세요.
            </p>
            <span style={{ fontSize: 12, color: "var(--accent)", fontFamily: "monospace" }}>
              github.com/shud26/shud-onepage/issues
            </span>
          </a>

          <a
            href="https://github.com/shud26"
            target="_blank"
            rel="noopener noreferrer"
            className="post-card"
            style={{ display: "block", textDecoration: "none" }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>
              GitHub 프로필
            </div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>
              전체 프로젝트 코드와 다른 작업물을 확인할 수 있습니다.
            </p>
            <span style={{ fontSize: 12, color: "var(--accent)", fontFamily: "monospace" }}>
              github.com/shud26
            </span>
          </a>
        </div>

        <div style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>
            문의 가능한 내용
          </h2>
          <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {["글 내용 오류 제보", "협업 및 스폰서 문의", "피드백 및 개선 제안", "기타"].map((item) => (
              <li key={item} style={{ fontSize: 14, color: "var(--text-secondary)", paddingLeft: 16, position: "relative" }}>
                <span style={{ position: "absolute", left: 0, color: "var(--accent)" }}>—</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
