import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { guides, categories } from '@/data/guides';
import GuideDetailClient from './GuideDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return guides.map((guide) => ({
    slug: guide.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = guides.find(g => g.slug === slug);

  if (!guide) {
    return {
      title: '가이드를 찾을 수 없습니다',
    };
  }

  return {
    title: `${guide.title} - SHUD Crypto 가이드`,
    description: guide.description,
    keywords: `${guide.title}, 코인 가이드, 암호화폐 투자, ${categories[guide.category]?.label}`,
    openGraph: {
      title: guide.title,
      description: guide.description,
      type: 'article',
      url: `https://tftchess.com/guides/${guide.slug}`,
      locale: 'ko_KR',
      siteName: 'SHUD Crypto Tools',
      publishedTime: guide.updatedAt,
      modifiedTime: guide.updatedAt,
      authors: ['SHUD'],
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.title,
      description: guide.description,
    },
    alternates: {
      canonical: `https://tftchess.com/guides/${guide.slug}`,
    },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = guides.find(g => g.slug === slug);

  if (!guide) {
    notFound();
  }

  // JSON-LD for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    datePublished: guide.updatedAt,
    dateModified: guide.updatedAt,
    author: {
      '@type': 'Person',
      name: 'SHUD',
    },
    publisher: {
      '@type': 'Organization',
      name: 'SHUD Crypto Tools',
      url: 'https://tftchess.com',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://tftchess.com/guides/${guide.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GuideDetailClient guide={guide} />
    </>
  );
}
