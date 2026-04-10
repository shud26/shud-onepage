import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | SHUD 크립토 일지",
    default: "SHUD 크립토 일지",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="light" style={{ minHeight: "100vh", background: "#fff" }}>
      {/* Blog Header */}
      <header className="blog-header">
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/blog" className="blog-logo">
            SHUD 크립토 일지
          </Link>
          <nav style={{ display: "flex", gap: 32, alignItems: "center" }}>
            <Link href="/blog" className="blog-nav-link">글 목록</Link>
            <Link href="/about" className="blog-nav-link">소개</Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* Footer */}
      <footer className="blog-footer">
        <div className="blog-container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span>© 2026 SHUD. 코딩 입문자의 크립토 자동화 일지.</span>
          <div style={{ display: "flex", gap: 20 }}>
            <Link href="/about" className="blog-footer-link">소개</Link>
            <Link href="/privacy" className="blog-footer-link">개인정보처리방침</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
