import Link from "next/link";
import { getAllPosts, getAllSeries, type PostMeta } from "@/lib/mdx";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "코딩 입문자의 크립토 자동화 일지 | SHUD",
  description:
    "코딩을 모르는 선생님이 AI(Claude Code)로 크립토 봇을 만들어가는 실전 기록. 성공도, 실패도 솔직하게.",
  alternates: { canonical: "https://tftchess.com" },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

function PostItem({ post }: { post: PostMeta }) {
  return (
    <Link href={`/blog/${post.slug}`} className="post-item">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div style={{ flex: 1 }}>
          {post.series && (
            <span className="tag tag-accent" style={{ marginBottom: 8, display: "inline-block" }}>
              {post.series}
            </span>
          )}
          <h3
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "var(--text-primary)",
              lineHeight: 1.45,
              marginBottom: 5,
              marginTop: post.series ? 6 : 0,
            }}
          >
            {post.title}
          </h3>
          <p
            style={{
              fontSize: 14,
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {post.description}
          </p>
        </div>
        <div style={{ flexShrink: 0, textAlign: "right", paddingTop: 2 }}>
          <div style={{ fontSize: 12, color: "var(--text-tertiary)", whiteSpace: "nowrap" }}>
            {formatDate(post.date)}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 3 }}>
            {post.readingTime}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const allPosts = getAllPosts();
  const series = getAllSeries();

  return (
    <div className="container" style={{ paddingTop: 64, paddingBottom: 80 }}>
      {/* Intro */}
      <div style={{ marginBottom: 56 }}>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.3,
            color: "var(--text-primary)",
            marginBottom: 14,
          }}
        >
          코딩 입문자의<br />크립토 자동화 일지
        </h1>
        <p
          style={{
            fontSize: 15,
            color: "var(--text-secondary)",
            lineHeight: 1.75,
            maxWidth: 480,
          }}
        >
          코딩 한 줄 못 짜던 선생님이 AI(Claude Code)로 크립토 봇을 만들어가는
          과정을 솔직하게 씁니다. 성공도 있고 실패도 있습니다.
        </p>
      </div>

      {/* Series pills */}
      {series.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 11, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 10 }}>
            연재 시리즈
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {series.map((s) => {
              const count = allPosts.filter((p) => p.series === s).length;
              return (
                <Link
                  key={s}
                  href={`/blog?series=${encodeURIComponent(s)}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "5px 11px",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    textDecoration: "none",
                  }}
                >
                  {s}
                  <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                    {count}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Post list */}
      <div>
        <p style={{ fontSize: 11, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 0 }}>
          최근 글 — {allPosts.length}편
        </p>
        {allPosts.length === 0 ? (
          <p style={{ fontSize: 14, color: "var(--text-tertiary)", padding: "48px 0" }}>
            곧 업로드 예정입니다.
          </p>
        ) : (
          <div>
            {allPosts.map((post) => (
              <PostItem key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
