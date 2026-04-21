// Community Dragon에서 TFT Set 17 데이터 가져오기

export interface ApiChampion {
  id: string;
  name: string;
  cost: 1 | 2 | 3 | 4 | 5;
  traits: string[];
  skill: string;
  skillDesc: string;
  imageUrl: string;
}

export interface ApiTrait {
  name: string;
  champCount: number;
}

interface CDragonChampion {
  apiName?: string;
  name: string;
  cost: number;
  traits: string[];
  ability?: { name?: string; desc?: string };
  squareIcon?: string;
  icon?: string;
}

interface CDragonTrait {
  name: string;
  desc?: string;
}

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

// 서버 메모리 캐시 (모듈 수준 - ISR/서버리스 재사용 시 유효)
let _cache: { champions: ApiChampion[]; traits: ApiTrait[] } | null = null;
let _fetchedAt = 0;
const CACHE_TTL = 1000 * 60 * 60;

export async function fetchTFTData(): Promise<{ champions: ApiChampion[]; traits: ApiTrait[] }> {
  if (_cache && Date.now() - _fetchedAt < CACHE_TTL) return _cache;

  const res = await fetch('https://raw.communitydragon.org/latest/cdragon/tft/ko_kr.json');
  const raw = await res.json();
  const set17 = raw.sets['17'] as { champions: CDragonChampion[]; traits: CDragonTrait[] };

  const champions: ApiChampion[] = set17.champions
    .filter((c) => c.traits?.length && [1, 2, 3, 4, 5].includes(c.cost))
    .map((c) => ({
      id: c.apiName || c.name,
      name: c.name,
      cost: c.cost as 1 | 2 | 3 | 4 | 5,
      traits: c.traits || [],
      skill: c.ability?.name || '',
      skillDesc: cleanDesc(c.ability?.desc || ''),
      imageUrl: c.squareIcon ? cdnImgUrl(c.squareIcon) : '',
    }))
    .sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name));

  const traitCount: Record<string, number> = {};
  for (const c of champions) {
    for (const t of c.traits) {
      traitCount[t] = (traitCount[t] || 0) + 1;
    }
  }

  const traits: ApiTrait[] = set17.traits
    .filter((t, i, arr) => arr.findIndex((x) => x.name === t.name) === i)
    .map((t) => ({ name: t.name, champCount: traitCount[t.name] || 0 }))
    .filter((t) => t.champCount > 0)
    .sort((a, b) => b.champCount - a.champCount);

  _cache = { champions, traits };
  _fetchedAt = Date.now();
  return _cache;
}
