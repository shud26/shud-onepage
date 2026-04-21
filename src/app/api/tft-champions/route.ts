import { NextResponse } from 'next/server';

interface CDragonChampion {
  apiName?: string;
  name: string;
  cost: number;
  traits: string[];
  ability?: { name?: string; desc?: string };
  squareIcon?: string;
}

interface CDragonTrait {
  name: string;
  desc?: string;
}

// 서버 메모리 캐시 (Vercel 서버리스 함수 재사용 시 유효)
let cache: { data: unknown; fetchedAt: number } | null = null;
const CACHE_TTL = 1000 * 60 * 60; // 1시간

function cdnImgUrl(iconPath: string): string {
  const lower = iconPath.toLowerCase();
  const path = lower.startsWith('assets/') ? lower : lower.replace(/^.*?assets\//, 'assets/');
  return `https://raw.communitydragon.org/latest/game/${path.replace(/\.tex$/, '.png')}`;
}

function cleanDesc(desc: string): string {
  return desc
    .replace(/<[^>]+>/g, '')
    .replace(/@[^@]+@/g, '??')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function GET() {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL) {
    return NextResponse.json(cache.data, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    });
  }

  const res = await fetch('https://raw.communitydragon.org/latest/cdragon/tft/ko_kr.json');
  const raw = await res.json();
  const set17 = raw.sets['17'] as { champions: CDragonChampion[]; traits: CDragonTrait[] };

  const champions = set17.champions
    .filter((c) => c.traits?.length && [1, 2, 3, 4, 5].includes(c.cost))
    .map((c) => ({
      id: c.apiName || c.name,
      name: c.name,
      cost: c.cost,
      traits: c.traits || [],
      skill: c.ability?.name || '',
      skillDesc: cleanDesc(c.ability?.desc || ''),
      imageUrl: c.squareIcon ? cdnImgUrl(c.squareIcon) : '',
    }))
    .sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name));

  // 시너지 집계
  const traitCount: Record<string, number> = {};
  for (const c of champions) {
    for (const t of c.traits) {
      traitCount[t] = (traitCount[t] || 0) + 1;
    }
  }

  const traits = set17.traits
    .filter((t, i, arr) => arr.findIndex((x) => x.name === t.name) === i)
    .map((t) => ({ name: t.name, champCount: traitCount[t.name] || 0 }))
    .filter((t) => t.champCount > 0)
    .sort((a, b) => b.champCount - a.champCount);

  const data = { champions, traits };
  cache = { data, fetchedAt: Date.now() };

  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  });
}
