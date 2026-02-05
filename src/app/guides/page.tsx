import type { Metadata } from 'next';
import GuidesPageClient from './GuidesPageClient';

export const metadata: Metadata = {
  title: '암호화폐 가이드 | 코인 초보자 필수 정보 - SHUD Crypto',
  description: '비트코인, 스테이킹, 에어드랍, DeFi, 거래소 비교 등 암호화폐 투자에 필요한 모든 정보를 쉽게 설명합니다. 코인 초보자 필독 가이드.',
  keywords: '코인 가이드, 비트코인 입문, 스테이킹 방법, 에어드랍 참여, 디파이 시작, 암호화폐 거래소, 코인 세금, NFT 구매',
  openGraph: {
    title: '암호화폐 가이드 | 코인 초보자 필수 정보',
    description: '비트코인부터 DeFi까지, 암호화폐 투자에 필요한 모든 정보를 담았습니다.',
    type: 'website',
    url: 'https://tftchess.com/guides',
    locale: 'ko_KR',
    siteName: 'SHUD Crypto Tools',
  },
  twitter: {
    card: 'summary_large_image',
    title: '암호화폐 가이드 | 코인 초보자 필수 정보',
    description: '비트코인, 스테이킹, DeFi 등 10개+ 상세 가이드',
  },
  alternates: {
    canonical: 'https://tftchess.com/guides',
  },
};

export default function GuidesPage() {
  return <GuidesPageClient />;
}
