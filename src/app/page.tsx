import Link from "next/link";
import { getAllPosts, getAllSeries, type PostMeta } from "@/lib/mdx";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "코딩 입문자의 크립토 자동화 일지 | SHUD Crypto",
  description:
    "코딩을 모르는 선생님이 AI(Claude Code)로 크립토 봇을 만들어가는 실전 기록. 펀딩비 차익거래, 에어드랍 파밍, 김프봇 개발 경험을 솔직하게 씁니다.",
  alternates: { canonical: "https://tftchess.com" },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

function PostCard({ post }: { post: PostMeta }) {
  return (
    <Link href={`/blog/${post.slug}`} className="post-card" style={{ display: "block" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        {post.series && (
          <span className="tag tag-accent">{post.series}</span>
        )}
        <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
          {formatDate(post.date)}
        </span>
        <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>·</span>
        <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{post.readingTime} 읽기</span>
      </div>
      <h3
        style={{
          fontSize: 17,
          fontWeight: 600,
          color: "var(--text-primary)",
          lineHeight: 1.45,
          marginBottom: 8,
        }}
      >
        {post.title}
      </h3>
      <p
        style={{
          fontSize: 14,
          color: "var(--text-secondary)",
          lineHeight: 1.65,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {post.description}
      </p>
      {post.tags.length > 0 && (
        <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
          {post.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

export default function HomePage() {
  const allPosts = getAllPosts();
  const latestPosts = allPosts.slice(0, 6);
  const series = getAllSeries();

  return (
    <div>
      {/* Hero */}
      <section style={{ padding: "72px 0 56px", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "var(--accent-dim)",
              border: "1px solid rgba(255,92,0,0.2)",
              borderRadius: 99,
              padding: "4px 12px",
              marginBottom: 20,
            }}
          >
            <span style={{ fontSize: 11, color: "var(--accent)", fontWeight: 500 }}>
              바이브코딩 실전 기록
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 40px)",
              fontWeight: 700,
              lineHeight: 1.25,
              letterSpacing: "-0.025em",
              color: "var(--text-primary)",
              marginBottom: 16,
            }}
          >
            코딩 입문자의<br />
            <span style={{ color: "var(--accent)" }}>크립토 자동화</span> 일지
          </h1>

          <p
            style={{
              fontSize: 16,
              color: "var(--text-secondary)",
              lineHeight: 1.75,
              maxWidth: 480,
              marginBottom: 28,
            }}
          >
            코딩 한 줄 못 짜던 선생님이 AI(Claude Code)로 크립토 봇을 만들어가는
            과정을 솔직하게 기록합니다. 성공도 있고 실패도 있습니다.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/blog" className="btn btn-primary">
              전체 글 보기
            </Link>
            <Link href="/about" className="btn btn-secondary">
              저자 소개
            </Link>
          </div>

          <div
            style={{
              display: "flex",
              gap: 32,
              marginTop: 40,
              paddingTop: 32,
              borderTop: "1px solid var(--border)",
            }}
          >
            {[
              { label: "총 포스트", value: `${allPosts.length}개` },
              { label: "시리즈", value: `${series.length}개` },
              { label: "개발 일수", value: "33일+" },
            ].map((item) => (
              <div key={item.label}>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {item.value}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 2 }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest posts */}
      <section style={{ padding: "56px 0" }}>
        <div className="container-wide">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 28,
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>
              최신 글
            </h2>
            <Link
              href="/blog"
              style={{ fontSize: 13, color: "var(--text-secondary)", textDecoration: "none" }}
            >
              전체 보기 →
            </Link>
          </div>

          {latestPosts.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 0",
                color: "var(--text-tertiary)",
                fontSize: 14,
              }}
            >
              <p>아직 작성된 글이 없습니다.</p>
              <p style={{ marginTop: 8 }}>곧 업로드 예정입니다.</p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 16,
              }}
            >
              {latestPosts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Series section */}
      {series.length > 0 && (
        <section style={{ padding: "56px 0", borderTop: "1px solid var(--border)" }}>
          <div className="container-wide">
            <h2
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "var(--text-primary)",
                marginBottom: 8,
              }}
            >
              연재 시리즈
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 28 }}>
              주제별로 묶은 글 모음
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 12,
              }}
            >
              {series.map((s) => {
                const count = allPosts.filter((p) => p.series === s).length;
                return (
                  <Link
                    key={s}
                    href={`/blog?series=${encodeURIComponent(s)}`}
                    className="post-card"
                    style={{ display: "block" }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        marginBottom: 6,
                      }}
                    >
                      {s}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                      {count}개 글
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* About teaser */}
      <section style={{ padding: "56px 0", borderTop: "1px solid var(--border)" }}>
        <div className="container">
          <div
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: "32px",
            }}
          >
            <p
              style={{
                fontSize: 13,
                color: "var(--accent)",
                fontWeight: 600,
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              저자 소개
            </p>
            <p
              style={{
                fontSize: 17,
                fontWeight: 600,
                color: "var(--text-primary)",
                lineHeight: 1.45,
                marginBottom: 12,
              }}
            >
              코딩 모르는 선생님이 AI로 크립토 봇을 만들고 있습니다
            </p>
            <p
              style={{
                fontSize: 14,
                color: "var(--text-secondary)",
                lineHeight: 1.7,
                marginBottom: 20,
              }}
            >
              교사 본업 그대로, 퇴근 후에 Claude Code 켜놓고 이것저것 만들어봅니다.
              코드는 잘 몰라도 아이디어가 있으면 된다는 걸 증명하는 중입니다.
            </p>
            <Link href="/about" className="btn btn-secondary">
              더 읽기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
