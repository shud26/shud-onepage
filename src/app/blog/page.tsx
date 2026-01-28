import type { Metadata } from 'next';
import BlogPageClient from './BlogPageClient';

export const metadata: Metadata = {
  title: '개발 블로그 | SHUD Crypto Tools',
  description: '바이브 코딩으로 만드는 크립토 도구 개발 일지. Claude Code와 함께하는 코딩 입문자의 성장 기록.',
  keywords: '바이브 코딩, vibe coding, 크립토 개발, Claude Code, 개발 블로그, 코딩 입문, 암호화폐 도구',
  openGraph: {
    title: '개발 블로그 | SHUD Crypto Tools',
    description: '바이브 코딩으로 만드는 크립토 도구 개발 일지. Claude Code와 함께하는 코딩 입문자의 성장 기록.',
    type: 'website',
    url: 'https://tftchess.com/blog',
    locale: 'ko_KR',
    siteName: 'SHUD Crypto Tools',
  },
  twitter: {
    card: 'summary',
    title: '개발 블로그 | SHUD Crypto Tools',
    description: '바이브 코딩으로 만드는 크립토 도구 개발 일지.',
  },
  alternates: {
    canonical: 'https://tftchess.com/blog',
  },
};

export default function BlogPage() {
  return <BlogPageClient />;
}
