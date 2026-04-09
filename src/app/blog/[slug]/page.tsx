import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getPost, getAllPosts, getSeriesPosts } from "@/lib/mdx";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    return { title: "글을 찾을 수 없습니다 | SHUD Crypto" };
  }

  const url = `https://tftchess.com/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    keywords: post.tags?.join(", "),
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url,
      locale: "ko_KR",
      siteName: "SHUD Crypto",
      publishedTime: post.date,
      tags: post.tags ?? [],
    },
    twitter: {
      card: "summary",
      title: post.title,
      description: post.description,
    },
    alternates: { canonical: url },
  };
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) notFound();

  const seriesPosts = post.series ? getSeriesPosts(post.series) : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    url: `https://tftchess.com/blog/${post.slug}`,
    author: {
      "@type": "Person",
      name: "SHUD",
      url: "https://github.com/shud26",
    },
    publisher: {
      "@type": "Organization",
      name: "SHUD Crypto",
      url: "https://tftchess.com",
    },
    keywords: post.tags?.join(", "),
    inLanguage: "ko",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div style={{ padding: "48px 0 80px" }}>
        <div className="blog-container">
          {/* Back link */}
          <Link
            href="/blog"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: "#aaa",
              textDecoration: "none",
              marginBottom: 32,
            }}
          >
            ← 블로그로 돌아가기
          </Link>

          {/* Post header */}
          <header style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              {post.series && (
                <span className="tag tag-accent">{post.series}</span>
              )}
              {post.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>

            <h1
              style={{
                fontSize: "clamp(24px, 4vw, 34px)",
                fontWeight: 700,
                lineHeight: 1.3,
                letterSpacing: "-0.025em",
                color: "#111",
                marginBottom: 16,
              }}
            >
              {post.title}
            </h1>

            <p
              style={{
                fontSize: 16,
                color: "#555",
                lineHeight: 1.65,
                marginBottom: 20,
              }}
            >
              {post.description}
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                paddingTop: 20,
                borderTop: "1px solid #e8e8e8",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "var(--accent-dim)",
                  border: "1px solid rgba(255,92,0,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--accent)",
                  flexShrink: 0,
                }}
              >
                S
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>
                  SHUD
                </div>
                <div style={{ fontSize: 12, color: "#999" }}>
                  {formatDate(post.date)} · {post.readingTime} 읽기
                </div>
              </div>
            </div>
          </header>

          {/* Series navigation */}
          {seriesPosts.length > 1 && (
            <div
              style={{
                background: "#f8f8f8",
                border: "1px solid #e8e8e8",
                borderRadius: 12,
                padding: "20px",
                marginBottom: 40,
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  color: "#bbb",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 600,
                  marginBottom: 12,
                }}
              >
                시리즈: {post.series}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {seriesPosts.map((sp, idx) => (
                  <Link
                    key={sp.slug}
                    href={`/blog/${sp.slug}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 10px",
                      borderRadius: 8,
                      textDecoration: "none",
                      background: sp.slug === post.slug ? "var(--accent-dim)" : "transparent",
                      border: sp.slug === post.slug ? "1px solid rgba(255,92,0,0.2)" : "1px solid transparent",
                      transition: "all 0.1s ease",
                    }}
                  >
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: sp.slug === post.slug ? "var(--accent)" : "var(--bg-hover)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 700,
                        color: sp.slug === post.slug ? "white" : "var(--text-tertiary)",
                        flexShrink: 0,
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        color: sp.slug === post.slug ? "var(--accent)" : "var(--text-secondary)",
                        fontWeight: sp.slug === post.slug ? 600 : 400,
                      }}
                    >
                      {sp.title}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* MDX content */}
          <article className="prose">
            <MDXRemote source={post.content} />
          </article>

          {/* Bottom nav */}
          <div
            style={{
              marginTop: 60,
              paddingTop: 32,
              borderTop: "1px solid #e8e8e8",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/blog"
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              ← 목록으로
            </Link>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {post.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
