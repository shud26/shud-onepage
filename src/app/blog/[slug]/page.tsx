import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import BlogPostClient from './BlogPostClient';

const supabaseUrl = 'https://ofpbscpcryquxrtojpei.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mcGJzY3BjcnlxdXhydG9qcGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMTY2MTMsImV4cCI6MjA4NDc5MjYxM30.xqmqiAXsxU9rCk6j9tV_0c3UjrX-t5ee5xsLUccpmE4';

type Props = {
  params: Promise<{ slug: string }>;
};

async function getPost(slug: string) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data } = await supabase
    .from('blog_posts')
    .select('title, description, tags, date, slug')
    .eq('slug', slug)
    .eq('published', true)
    .single();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: '글을 찾을 수 없습니다 | SHUD Blog',
    };
  }

  const title = `${post.title} | SHUD Blog`;
  const description = post.description;
  const url = `https://tftchess.com/blog/${post.slug}`;

  return {
    title,
    description,
    keywords: post.tags?.join(', '),
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      url,
      locale: 'ko_KR',
      siteName: 'SHUD Crypto Tools',
      publishedTime: post.date,
      tags: post.tags || [],
    },
    twitter: {
      card: 'summary',
      title: post.title,
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  // JSON-LD structured data
  const jsonLd = post
    ? {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        url: `https://tftchess.com/blog/${post.slug}`,
        author: {
          '@type': 'Person',
          name: 'SHUD',
          url: 'https://github.com/shud26',
        },
        publisher: {
          '@type': 'Organization',
          name: 'SHUD Crypto Tools',
          url: 'https://tftchess.com',
        },
        keywords: post.tags?.join(', '),
        inLanguage: 'ko',
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `https://tftchess.com/blog/${post.slug}`,
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <BlogPostClient />
    </>
  );
}
