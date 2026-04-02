import Link from "next/link";
import { getAllPosts, getAllSeries, type PostMeta } from "@/lib/mdx";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "블로그 | SHUD Crypto",
  description:
    "코딩 입문자의 크립토 자동화 일지. 펀딩비 봇, 에어드랍 파밍, 김프 차익거래 실전 경험을 솔직하게 씁니다.",
  alternates: { canonical: "https://tftchess.com/blog" },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

function PostRow({ post }: { post: PostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      style={{
        display: "block",
        padding: "20px 0",
        borderBottom: "1px solid var(--border)",
        textDecoration: "none",
        transition: "all 0.1s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            {post.series && (
              <span className="tag tag-accent">{post.series}</span>
            )}
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "var(--text-primary)",
              lineHeight: 1.45,
              marginBottom: 6,
            }}
          >
            {post.title}
          </h2>
          <p
            style={{
              fontSize: 13,
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
        <div
          style={{
            flexShrink: 0,
            textAlign: "right",
          }}
        >
          <div style={{ fontSize: 12, color: "var(--text-tertiary)", whiteSpace: "nowrap" }}>
            {formatDate(post.date)}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 4 }}>
            {post.readingTime} 읽기
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
    <div style={{ padding: "48px 0" }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
              marginBottom: 8,
            }}
          >
            블로그
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
            총 {allPosts.length}개 글 · {allSeries.length}개 시리즈
          </p>
        </div>

        {/* Series filter */}
        {allSeries.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <p
              style={{
                fontSize: 11,
                color: "var(--text-tertiary)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 10,
                fontWeight: 600,
              }}
            >
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
                      gap: 6,
                      padding: "6px 12px",
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 13,
                      color: "var(--text-secondary)",
                      textDecoration: "none",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {s}
                    <span
                      style={{
                        background: "var(--bg-hover)",
                        borderRadius: 99,
                        padding: "1px 6px",
                        fontSize: 11,
                        color: "var(--text-tertiary)",
                      }}
                    >
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
          <div
            style={{
              textAlign: "center",
              padding: "80px 0",
              color: "var(--text-tertiary)",
              fontSize: 14,
            }}
          >
            <p>아직 작성된 글이 없습니다.</p>
            <p style={{ marginTop: 8 }}>곧 업로드 예정입니다.</p>
          </div>
        ) : (
          <div>
            {allPosts.map((post) => (
              <PostRow key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
