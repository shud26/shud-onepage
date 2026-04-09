import Link from "next/link";
import { getAllPosts, getAllSeries, type PostMeta } from "@/lib/mdx";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "크립토 자동화 일지 | SHUD",
  description: "코딩 입문자 선생님이 AI로 크립토 봇을 만들어가는 실전 기록. 나도봇, 펀딩비 차익거래, 에어드랍 파밍 솔직 후기.",
  alternates: { canonical: "https://tftchess.com/blog" },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

function PostItem({ post }: { post: PostMeta }) {
  return (
    <Link href={`/blog/${post.slug}`} className="post-item" style={{ padding: "24px 0" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div style={{ flex: 1 }}>
          {post.series && (
            <span className="tag tag-accent" style={{ marginBottom: 8, display: "inline-block" }}>
              {post.series}
            </span>
          )}
          <h2
            style={{
              fontSize: 17,
              fontWeight: 600,
              color: "#111",
              lineHeight: 1.45,
              marginBottom: 6,
              marginTop: post.series ? 6 : 0,
              letterSpacing: "-0.01em",
            }}
          >
            {post.title}
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "#666",
              lineHeight: 1.65,
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
          <div style={{ fontSize: 12, color: "#aaa", whiteSpace: "nowrap" }}>
            {formatDate(post.date)}
          </div>
          <div style={{ fontSize: 12, color: "#bbb", marginTop: 3 }}>
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
    <div className="blog-container" style={{ paddingTop: 52, paddingBottom: 80 }}>
      <div style={{ marginBottom: 40 }}>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "-0.025em",
            color: "#111",
            marginBottom: 6,
          }}
        >
          크립토 자동화 일지
        </h1>
        <p style={{ fontSize: 14, color: "#888" }}>
          코딩 입문자의 봇 운영 솔직 기록 · {allPosts.length}편
        </p>
      </div>

      {/* Series */}
      {allSeries.length > 0 && (
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 11, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 10 }}>
            시리즈
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {allSeries.map((s) => {
              const count = allPosts.filter((p) => p.series === s).length;
              return (
                <span
                  key={s}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "5px 11px",
                    background: "#f5f5f5",
                    border: "1px solid #e8e8e8",
                    borderRadius: 6,
                    fontSize: 13,
                    color: "#555",
                  }}
                >
                  {s}
                  <span style={{ fontSize: 11, color: "#aaa" }}>{count}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Post list */}
      {allPosts.length === 0 ? (
        <p style={{ fontSize: 14, color: "#bbb", padding: "48px 0" }}>
          곧 첫 글이 올라옵니다.
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
