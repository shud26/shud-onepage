export type TraitKey = 'piltover'|'shadow'|'freljord'|'noxus'|'ionian'|'void'|'mage'|'warrior';
export type Cost = 1|2|3|4|5;
export type Tier = 'S'|'A'|'B'|'C';

export const COST_COLORS: Record<Cost, string> = {
  1:'#909090', 2:'#22a050', 3:'#1d72b8', 4:'#9b45e0', 5:'#C89B3C'
};
export const TIER_COLORS: Record<Tier, string> = {
  S:'#C89B3C', A:'#9b45e0', B:'#1d72b8', C:'#5c7080'
};
export const TRAIT_COLORS: Record<TraitKey, string> = {
  piltover:'#4A9EE8', shadow:'#8B5CF6', freljord:'#60D8F0',
  noxus:'#E85454', ionian:'#4AE890', void:'#C060F0', mage:'#60A8F0', warrior:'#E8A454'
};
export const TRAIT_LABELS: Record<TraitKey, string> = {
  piltover:'필트오버', shadow:'그림자', freljord:'프렐요드',
  noxus:'녹서스', ionian:'아이오니아', void:'공허', mage:'마법사', warrior:'전사'
};

export interface Champion {
  id: number; name: string; cost: Cost;
  traits: TraitKey[]; skill: string; skillDesc: string;
}
export interface Deck {
  id: number; name: string; tier: Tier;
  difficulty: '쉬움'|'보통'|'어려움'; style: '재구름'|'고정';
  traits: TraitKey[]; unitIds: number[];
  avgPlace: number; playRate: number; winRate: number;
  coreItems: string[]; tips: string[]; synergy: string;
}
export interface BaseItem { id: string; name: string; color: string; abbr: string; }

export const CHAMPIONS: Champion[] = [
  { id:1,  name:'징크스',   cost:1, traits:['piltover','warrior'], skill:'슈퍼 메가 데스 로켓', skillDesc:'전방 광역 피해를 주고 치명적인 폭발을 일으킵니다.' },
  { id:2,  name:'에코',     cost:1, traits:['piltover','mage'],    skill:'시간 폭탄',            skillDesc:'가까운 적에게 폭탄을 던져 피해를 줍니다.' },
  { id:3,  name:'르블랑',   cost:2, traits:['shadow','mage'],      skill:'왜곡',                 skillDesc:'위치를 바꾸며 마법 피해를 줍니다.' },
  { id:4,  name:'씬드라',   cost:2, traits:['void','mage'],        skill:'어둠의 구슬',          skillDesc:'마법 구슬로 적을 연속으로 타격합니다.' },
  { id:5,  name:'아셀',     cost:3, traits:['freljord','warrior'],  skill:'빙하 붕괴',            skillDesc:'빙하 조각을 소환해 적에게 피해를 줍니다.' },
  { id:6,  name:'다리우스', cost:3, traits:['noxus','warrior'],    skill:'처형의 도끼',          skillDesc:'회전 공격으로 주변 적들에게 큰 피해를 줍니다.' },
  { id:7,  name:'야스오',   cost:3, traits:['ionian','warrior'],   skill:'강풍',                 skillDesc:'전방 적을 뒤로 밀쳐내며 피해를 줍니다.' },
  { id:8,  name:'리산드라', cost:4, traits:['freljord','mage'],    skill:'얼음 무덤',            skillDesc:'적을 얼음 안에 가둬 피해를 줍니다.' },
  { id:9,  name:'카사딘',   cost:4, traits:['void','mage'],        skill:'공허 관문',            skillDesc:'순간이동 후 전방 적에게 마법 피해를 줍니다.' },
  { id:10, name:'렉사이',   cost:4, traits:['void','warrior'],     skill:'지하로',               skillDesc:'땅속으로 이동해 적을 기습합니다.' },
  { id:11, name:'갈리오',   cost:5, traits:['piltover','warrior'], skill:'수호자의 난입',        skillDesc:'동맹군 위치로 점프해 주변 적에게 큰 피해를 줍니다.' },
  { id:12, name:'오리아나', cost:5, traits:['piltover','mage'],    skill:'명령: 쉴드',           skillDesc:'공을 발사해 적을 끌어당기고 광역 피해를 줍니다.' },
];

export const DECKS: Deck[] = [
  { id:1, name:'공허 마법사', tier:'S', difficulty:'보통', style:'재구름',
    traits:['void','mage'], unitIds:[4,9,10,8,3,5,2,1],
    avgPlace:3.8, playRate:18.4, winRate:14.2,
    coreItems:['라바돈의 죽음모자','무한의 검','구인수의 격노검'],
    tips:['초반에 공허 유닛 3개 확보','4코스트 업그레이드 우선','아이템은 카사딘 집중'],
    synergy:'공허 3 + 마법사 4' },
  { id:2, name:'녹서스 전사', tier:'S', difficulty:'쉬움', style:'고정',
    traits:['noxus','warrior'], unitIds:[6,7,5,10,1,2,3,4],
    avgPlace:4.1, playRate:22.1, winRate:11.8,
    coreItems:['피바라기','독이 든 가시','위저드리'],
    tips:['다리우스 아이템 집중','녹서스 2 + 전사 4 목표','후반 렉사이 추가'],
    synergy:'녹서스 2 + 전사 4' },
  { id:3, name:'필트오버 리롤', tier:'A', difficulty:'어려움', style:'재구름',
    traits:['piltover','mage'], unitIds:[1,2,12,11,7,8,4,9],
    avgPlace:4.3, playRate:12.7, winRate:9.4,
    coreItems:['테크마투르지','스태틱의 단검','최후의 속삭임'],
    tips:['레벨 6에서 리롤 집중','징크스/에코 3성 목표','갈리오는 4코스트'],
    synergy:'필트오버 4 + 마법사 2' },
  { id:4, name:'프렐요드 빙결', tier:'A', difficulty:'보통', style:'고정',
    traits:['freljord','warrior'], unitIds:[5,8,6,7,10,1,3,12],
    avgPlace:4.5, playRate:9.3, winRate:8.7,
    coreItems:['유리검','구인수의 격노검','무한의 검'],
    tips:['아셀 아이템 우선','프렐요드 3 목표','후반 리산드라 추가'],
    synergy:'프렐요드 3 + 전사 3' },
  { id:5, name:'그림자 조합', tier:'B', difficulty:'보통', style:'재구름',
    traits:['shadow','mage'], unitIds:[3,9,4,8,1,2,6,7],
    avgPlace:4.8, playRate:8.1, winRate:7.2,
    coreItems:['라바돈의 죽음모자','무한의 검','시비르의 망토'],
    tips:['르블랑 아이템 집중','그림자 2 우선','마법사 시너지 병행'],
    synergy:'그림자 2 + 마법사 4' },
];

export const BASE_ITEMS: BaseItem[] = [
  { id:'bf',       name:'BF 대검',    color:'#E85454', abbr:'BF' },
  { id:'bow',      name:'반복 석궁',   color:'#22a050', abbr:'활' },
  { id:'chain',    name:'사슬 조끼',   color:'#909090', abbr:'갑' },
  { id:'rod',      name:'불필요한 지팡이', color:'#60A8F0', abbr:'지' },
  { id:'tear',     name:'여신의 눈물', color:'#4A9EE8', abbr:'눈' },
  { id:'belt',     name:'자이언트 허리띠', color:'#E8A454', abbr:'허' },
  { id:'spatula',  name:'스파튤라',    color:'#C89B3C', abbr:'주' },
  { id:'gloves',   name:'무효화 장갑', color:'#C060F0', abbr:'장' },
  { id:'cloak',    name:'음전기 망토', color:'#8B5CF6', abbr:'망' },
];

type ComboMap = Record<string, { name: string; effect: string; champ: string }>;
export const ITEM_COMBOS: ComboMap = {
  'bf+bf':      { name:'무한의 검',       effect:'공격력 +60',                           champ:'다리우스, 야스오' },
  'bf+bow':     { name:'피바라기',         effect:'공격력 +15, 공격속도 +15%',            champ:'징크스' },
  'bf+chain':   { name:'갑옷파괴기',       effect:'공격 시 방어력 40% 감소',              champ:'다리우스' },
  'bf+rod':     { name:'황폐화',           effect:'공격력 +20, 주문력 +20',               champ:'오리아나' },
  'bf+tear':    { name:'유리검',           effect:'최대 마나에 비례한 공격력',             champ:'야스오, 아셀' },
  'bow+bow':    { name:'폭풍검',           effect:'공격속도 +55%, 30% 확률 번개',         champ:'징크스' },
  'bow+rod':    { name:'최후의 속삭임',    effect:'방어 관통 33%',                        champ:'징크스, 에코' },
  'rod+rod':    { name:'라바돈의 죽음모자', effect:'주문력 +75',                           champ:'씬드라, 카사딘' },
  'rod+tear':   { name:'테크마투르지',     effect:'주문력 +45, 추가 마나 생성',           champ:'오리아나, 르블랑' },
  'rod+gloves': { name:'구인수의 격노검',  effect:'마법 치명타 +30%',                     champ:'리산드라' },
  'chain+chain':{ name:'용의 발톱',        effect:'주문 피해 75% 감소',                   champ:'탱커' },
  'chain+belt': { name:'양의 갑옷',        effect:'방어력 +80',                           champ:'갈리오' },
  'belt+belt':  { name:'선혈 갑옷',        effect:'체력 +600, 피해 시 회복',              champ:'렉사이' },
  'tear+tear':  { name:'정령 주문서',      effect:'마나 빠르게 충전',                     champ:'에코' },
  'spatula+rod':{ name:'위저드리',         effect:'마법사 특성 추가',                     champ:'모든 챔피언' },
};

export const META_CHAMPS = CHAMPIONS.map((c, i) => ({
  ...c,
  pickRate: Math.max(5, 30 - i * 2 + Math.random() * 5).toFixed(1),
  winRate:  Math.max(3, 18 - i * 1.2 + Math.random() * 3).toFixed(1),
  avgPlace: (3.5 + i * 0.2 + Math.random() * 0.5).toFixed(1),
}));

export const META_AUGMENTS = [
  { name:'공허의 메아리',   tier:'S' as Tier, avgPlace:3.6, pickRate:14.2 },
  { name:'마법사의 길',     tier:'S' as Tier, avgPlace:3.8, pickRate:11.8 },
  { name:'전쟁광',          tier:'A' as Tier, avgPlace:4.1, pickRate:18.4 },
  { name:'혈전',            tier:'A' as Tier, avgPlace:4.3, pickRate:9.7  },
  { name:'고독한 사냥꾼',   tier:'A' as Tier, avgPlace:4.4, pickRate:8.1  },
  { name:'구인수의 가호',   tier:'B' as Tier, avgPlace:4.7, pickRate:21.3 },
  { name:'재구름의 행운',   tier:'B' as Tier, avgPlace:4.8, pickRate:16.5 },
  { name:'안정된 재정',     tier:'C' as Tier, avgPlace:5.1, pickRate:24.7 },
];
