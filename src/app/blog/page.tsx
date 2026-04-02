import Link from "next/link";
import { getAllPosts, getAllSeries, type PostMeta } from "@/lib/mdx";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "블로그 | SHUD",
  description: "코딩 입문자의 크립토 자동화 일지. 펀딩비 봇, 에어드랍 파밍, 김프 차익거래 실전 기록.",
  alternates: { canonical: "https://tftchess.com/blog" },
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
          <h2
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
          </h2>
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

export default function BlogPage() {
  const allPosts = getAllPosts();
  const allSeries = getAllSeries();

  return (
    <div className="container" style={{ paddingTop: 56, paddingBottom: 80 }}>
      <div style={{ marginBottom: 40 }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "var(--text-primary)",
            marginBottom: 6,
          }}
        >
          블로그
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
          {allPosts.length}개 글 · {allSeries.length}개 시리즈
        </p>
      </div>

      {/* Series filter */}
      {allSeries.length > 0 && (
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 11, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 10 }}>
            시리즈
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {allSeries.map((s) => {
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
  );
}
