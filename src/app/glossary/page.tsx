import type { Metadata } from 'next';
import GlossaryPageClient from './GlossaryPageClient';

export const metadata: Metadata = {
  title: '코인 용어 사전 | 암호화폐 용어 총정리 - SHUD Crypto Tools',
  description: '비트코인, 이더리움, DeFi, NFT, 스테이킹, 김치프리미엄 등 암호화폐 용어를 쉽게 설명합니다. 코인 초보자를 위한 필수 용어 사전.',
  keywords: '코인 용어, 암호화폐 용어, 비트코인 뜻, 이더리움이란, 디파이 뜻, 스테이킹이란, 에어드랍 뜻, 김치프리미엄, NFT 뜻, 블록체인 용어',
  openGraph: {
    title: '코인 용어 사전 | 암호화폐 용어 총정리',
    description: '비트코인, 이더리움, DeFi, NFT, 스테이킹 등 암호화폐 용어를 쉽게 설명합니다.',
    type: 'website',
    url: 'https://tftchess.com/glossary',
    locale: 'ko_KR',
    siteName: 'SHUD Crypto Tools',
  },
  twitter: {
    card: 'summary',
    title: '코인 용어 사전 | 암호화폐 용어 총정리',
    description: '코인 초보자를 위한 필수 용어 사전. 37개+ 핵심 용어 쉽게 설명.',
  },
  alternates: {
    canonical: 'https://tftchess.com/glossary',
  },
};

export default function GlossaryPage() {
  return <GlossaryPageClient />;
}
