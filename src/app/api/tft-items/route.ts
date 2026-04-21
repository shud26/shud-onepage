import { NextResponse } from 'next/server';

const BASE_IDS = new Set([
  'TFT_Item_BFSword', 'TFT_Item_RecurveBow', 'TFT_Item_ChainVest',
  'TFT_Item_NeedlesslyLargeRod', 'TFT_Item_TearOfTheGoddess',
  'TFT_Item_GiantsBelt', 'TFT_Item_Spatula', 'TFT_Item_SparringGloves',
  'TFT_Item_NegatronCloak',
]);

function cdnImgUrl(iconPath: string): string {
  const lower = iconPath.toLowerCase();
  const path = lower.startsWith('assets/') ? lower : lower.replace(/^.*?assets\//, 'assets/');
  return `https://raw.communitydragon.org/latest/game/${path.replace(/\.tex$/, '.png')}`;
}

interface RawItem {
  apiName?: string;
  name: string;
  composition?: string[];
  icon?: string;
  desc?: string;
}

let cache: { data: unknown; fetchedAt: number } | null = null;
const CACHE_TTL = 1000 * 60 * 60;

export async function GET() {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL) {
    return NextResponse.json(cache.data, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    });
  }

  const res = await fetch('https://raw.communitydragon.org/latest/cdragon/tft/ko_kr.json');
  const raw = await res.json();
  const allItems: RawItem[] = raw.items || [];

  // 기본 아이템 9개
  const baseItems = allItems
    .filter((i) => i.apiName && BASE_IDS.has(i.apiName))
    .map((i) => ({
      id: i.apiName!,
      name: i.name,
      imageUrl: i.icon ? cdnImgUrl(i.icon) : '',
    }));

  // 조합 아이템 (기본 아이템 2개로 구성, 상징 제외, 중복 제거)
  const seen = new Set<string>();
  const comboItems = allItems
    .filter((i) => {
      const comp = i.composition;
      if (!comp || comp.length !== 2) return false;
      if (!comp.every((c) => BASE_IDS.has(c))) return false;
      if (!i.name || i.name.startsWith('tft_') || i.name.startsWith('game_') || i.name.startsWith('TFT_')) return false;
      if (i.name.includes('상징')) return false;
      if (!i.icon?.includes('Hexcore')) return false;
      const key = [...comp].sort().join('+');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((i) => ({
      id: i.apiName || i.name,
      name: i.name,
      composition: i.composition!,
      imageUrl: i.icon ? cdnImgUrl(i.icon) : '',
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const data = { baseItems, comboItems };
  cache = { data, fetchedAt: Date.now() };

  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  });
}
