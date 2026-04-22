export type Cost = 1|2|3|4|5;
export type Tier = 'S'|'A'|'B'|'C';

export const COST_COLORS: Record<Cost, string> = {
  1:'#909090', 2:'#22a050', 3:'#1d72b8', 4:'#9b45e0', 5:'#C89B3C'
};
export const TIER_COLORS: Record<Tier, string> = {
  S:'#C89B3C', A:'#9b45e0', B:'#1d72b8', C:'#5c7080'
};

export interface Deck {
  id: number; name: string; tier: Tier;
  difficulty: '쉬움'|'보통'|'어려움'; style: '재구름'|'고정';
  traits: string[];
  // 실제 Set 17 챔피언 apiName 사용
  unitApiNames: string[];
  avgPlace: number; playRate: number; winRate: number;
  coreItems: string[]; tips: string[]; synergy: string;
}

// Set 17 Arcane Depths 실제 메타 덱 (2025 시즌)
export const DECKS: Deck[] = [
  {
    id: 1, name: 'N.O.V.A. 도전자', tier: 'S', difficulty: '보통', style: '고정',
    traits: ['N.O.V.A.', '도전자', '습격자'],
    unitApiNames: [
      'TFT17_Aatrox',    // 1코 N.O.V.A. 요새
      'TFT17_Caitlyn',   // 1코 N.O.V.A. 운명술사
      'TFT17_Akali',     // 2코 N.O.V.A. 습격자
      'TFT17_Belveth',   // 2코 태고족 도전자
      'TFT17_Jinx',      // 2코 동물특공대 도전자
      'TFT17_Maokai',    // 3코 N.O.V.A. 싸움꾼
      'TFT17_Kindred',   // 4코 N.O.V.A. 도전자
      'TFT17_MasterYi',  // 4코 초능력 습격자
    ],
    avgPlace: 3.7, playRate: 21.3, winRate: 14.8,
    coreItems: ['무한의 대검', '최후의 속삭임', '피바라기'],
    tips: ['킨드레드에게 공격 아이템 집중', 'N.O.V.A. 3 + 습격자 3 목표', '도전자 추가로 공속 확보'],
    synergy: 'N.O.V.A. 3 + 도전자 4',
  },
  {
    id: 2, name: '별돌보미 리롤', tier: 'S', difficulty: '어려움', style: '재구름',
    traits: ['별돌보미', '운명술사', '복제자'],
    unitApiNames: [
      'TFT17_Talon',         // 1코 별돌보미 불한당
      'TFT17_TwistedFate',   // 1코 별돌보미 운명술사
      'TFT17_Jax',           // 2코 별돌보미 요새
      'TFT17_Milio',         // 2코 시간균열자 운명술사
      'TFT17_Lulu',          // 3코 별돌보미 복제자
      'TFT17_Nunu',          // 4코 별돌보미 선봉대
      'TFT17_Xayah',         // 4코 별돌보미 저격수
      'TFT17_Bard',          // 5코 정령족 전달자
    ],
    avgPlace: 3.9, playRate: 18.6, winRate: 12.4,
    coreItems: ['보석 건틀릿', '라바돈의 죽음모자', '구인수의 격노검'],
    tips: ['레벨 6에서 별돌보미 리롤', '트위스티드 페이트/탈론 3성 목표', '자야 아이템은 활 계열'],
    synergy: '별돌보미 6 + 운명술사 3',
  },
  {
    id: 3, name: '정령족 조합', tier: 'A', difficulty: '쉬움', style: '고정',
    traits: ['정령족', '복제자', '요새'],
    unitApiNames: [
      'TFT17_Veigar',        // 1코 정령족 복제자
      'TFT17_Poppy',         // 1코 정령족 요새
      'TFT17_IvernMinion',   // 2코 정령족 길잡이
      'TFT17_Gnar',          // 2코 정령족 저격수
      'TFT17_Fizz',          // 3코 정령족 불한당
      'TFT17_Rammus',        // 4코 정령족 요새
      'TFT17_Corki',         // 4코 정령족 운명술사
      'TFT17_Bard',          // 5코 정령족 전달자
    ],
    avgPlace: 4.1, playRate: 14.2, winRate: 10.3,
    coreItems: ['모렐로노미콘', '라바돈의 죽음모자', '대천사의 지팡이'],
    tips: ['정령족 4개 먼저 확보', '코르키/바드 아이템 집중', '요새 시너지로 탱킹 확보'],
    synergy: '정령족 6 + 요새 4',
  },
  {
    id: 4, name: '암흑의 별 킬러', tier: 'A', difficulty: '보통', style: '고정',
    traits: ['암흑의 별', '불한당', '말살자'],
    unitApiNames: [
      'TFT17_Lissandra',  // 1코 암흑의 별 복제자
      'TFT17_Chogath',    // 1코 암흑의 별 싸움꾼
      'TFT17_Mordekaiser',// 2코 암흑의 별 전달자
      'TFT17_Kaisa',      // 3코 암흑의 별 불한당
      'TFT17_Karma',      // 4코 암흑의 별 여행자
      'TFT17_Jhin',       // 5코 암흑의 별 말살자 저격수
      'TFT17_Briar',      // 1코 동물특공대 불한당
      'TFT17_Diana',      // 3코 중재자 도전자
    ],
    avgPlace: 4.3, playRate: 11.8, winRate: 9.2,
    coreItems: ['무한의 대검', '거인 학살자', '최후의 속삭임'],
    tips: ['진(Jhin) 아이템 최우선', '암흑의 별 4 목표', '불한당 시너지로 추가 피해'],
    synergy: '암흑의 별 4 + 말살자 2',
  },
  {
    id: 5, name: '동물특공대 파티', tier: 'B', difficulty: '쉬움', style: '재구름',
    traits: ['동물특공대', '선봉대', '불한당'],
    unitApiNames: [
      'TFT17_Briar',     // 1코 동물특공대 불한당
      'TFT17_Leona',     // 1코 중재자 선봉대
      'TFT17_Jinx',      // 2코 동물특공대 도전자
      'TFT17_Aurora',    // 3코 동물특공대 여행자
      'TFT17_Illaoi',    // 3코 동물특공대 선봉대
      'TFT17_Nunu',      // 4코 별돌보미 선봉대
      'TFT17_Fiora',     // 5코 동물특공대 습격자
      'TFT17_Blitzcrank',// 5코 파티광 선봉대
    ],
    avgPlace: 4.6, playRate: 9.4, winRate: 7.8,
    coreItems: ['태양불꽃 망토', '덤불 조끼', '워모그의 갑옷'],
    tips: ['동물특공대 4 + 선봉대 3 목표', '블리츠크랭크로 후열 끌어오기', '피오라 아이템 집중'],
    synergy: '동물특공대 4 + 선봉대 4',
  },
  {
    id: 6, name: '태고족 싸움꾼', tier: 'A', difficulty: '보통', style: '고정',
    traits: ['태고족', '싸움꾼', '선봉대'],
    unitApiNames: [
      'TFT17_Maokai',    // 3코 N.O.V.A. 싸움꾼
      'TFT17_Illaoi',    // 3코 동물특공대 선봉대
      'TFT17_Chogath',   // 1코 암흑의 별 싸움꾼
      'TFT17_Leona',     // 1코 중재자 선봉대
      'TFT17_Rammus',    // 4코 정령족 요새
      'TFT17_Nunu',      // 4코 별돌보미 선봉대
      'TFT17_Galio',     // 5코 태고족 복제자
      'TFT17_Mordekaiser',// 2코 암흑의 별 전달자
    ],
    avgPlace: 4.0, playRate: 12.1, winRate: 10.5,
    coreItems: ['워모그의 갑옷', '가시 조끼', '선혈 갑옷'],
    tips: ['갈리오에게 AP 아이템 집중', '태고족 4 + 싸움꾼 4 목표', '앞줄 선봉대로 버티기'],
    synergy: '태고족 4 + 싸움꾼 4',
  },
  {
    id: 7, name: '저격수 말살자', tier: 'A', difficulty: '쉬움', style: '고정',
    traits: ['저격수', '말살자', '불한당'],
    unitApiNames: [
      'TFT17_Caitlyn',   // 1코 N.O.V.A. 운명술사
      'TFT17_Gnar',      // 2코 정령족 저격수
      'TFT17_MissFortune',// 3코 불한당 저격수
      'TFT17_Kaisa',     // 3코 암흑의 별 불한당
      'TFT17_Jinx',      // 2코 동물특공대 도전자
      'TFT17_Xayah',     // 4코 별돌보미 저격수
      'TFT17_Jhin',      // 5코 암흑의 별 말살자 저격수
      'TFT17_Leona',     // 1코 중재자 선봉대
    ],
    avgPlace: 4.0, playRate: 13.5, winRate: 10.9,
    coreItems: ['폭발성 산탄총', '구인수의 격노검', '최후의 속삭임'],
    tips: ['진(Jhin) 캐리로 아이템 집중', '저격수 4 활성화 우선', '자야로 백라인 공격 가능'],
    synergy: '저격수 4 + 말살자 2',
  },
  {
    id: 8, name: '중재자 여행자', tier: 'B', difficulty: '보통', style: '재구름',
    traits: ['중재자', '여행자', '운명술사'],
    unitApiNames: [
      'TFT17_Leona',     // 1코 중재자 선봉대
      'TFT17_Diana',     // 3코 중재자 도전자
      'TFT17_Aurora',    // 3코 동물특공대 여행자
      'TFT17_Karma',     // 4코 암흑의 별 여행자
      'TFT17_Milio',     // 2코 시간균열자 운명술사
      'TFT17_Corki',     // 4코 정령족 운명술사
      'TFT17_TwistedFate',// 1코 별돌보미 운명술사
      'TFT17_Kindred',   // 4코 N.O.V.A. 도전자
    ],
    avgPlace: 4.5, playRate: 8.7, winRate: 8.1,
    coreItems: ['라바돈의 죽음모자', '모렐로노미콘', '대천사의 지팡이'],
    tips: ['카르마/오로라 AP 아이템', '중재자 4 + 여행자 3 목표', '운명술사로 궁 강화'],
    synergy: '중재자 4 + 여행자 3',
  },
  {
    id: 9, name: '초능력 습격자', tier: 'B', difficulty: '어려움', style: '재구름',
    traits: ['초능력', '습격자', '불한당'],
    unitApiNames: [
      'TFT17_Akali',     // 2코 N.O.V.A. 습격자
      'TFT17_Briar',     // 1코 동물특공대 불한당
      'TFT17_Fizz',      // 3코 정령족 불한당
      'TFT17_MasterYi',  // 4코 초능력 습격자
      'TFT17_Kaisa',     // 3코 암흑의 별 불한당
      'TFT17_Fiora',     // 5코 동물특공대 습격자
      'TFT17_Diana',     // 3코 중재자 도전자
      'TFT17_Belveth',   // 2코 태고족 도전자
    ],
    avgPlace: 4.7, playRate: 7.3, winRate: 6.9,
    coreItems: ['무한의 대검', '피바라기', '칼날비'],
    tips: ['마스터 이 + 피오라 아이템 분산', '습격자 4 목표', '초능력 3으로 후열 점프'],
    synergy: '초능력 3 + 습격자 4',
  },
  {
    id: 10, name: '우주 그루브 파티', tier: 'C', difficulty: '쉬움', style: '재구름',
    traits: ['우주 그루브', '선봉대', '싸움꾼'],
    unitApiNames: [
      'TFT17_Leona',     // 1코 중재자 선봉대
      'TFT17_Chogath',   // 1코 암흑의 별 싸움꾼
      'TFT17_Illaoi',    // 3코 동물특공대 선봉대
      'TFT17_Maokai',    // 3코 N.O.V.A. 싸움꾼
      'TFT17_Rammus',    // 4코 정령족 요새
      'TFT17_Nunu',      // 4코 별돌보미 선봉대
      'TFT17_Galio',     // 5코 태고족 복제자
      'TFT17_Blitzcrank',// 5코 파티광 선봉대
    ],
    avgPlace: 5.1, playRate: 5.6, winRate: 5.2,
    coreItems: ['워모그의 갑옷', '선혈 갑옷', '데모니쉬 엠브레이서'],
    tips: ['탱커 위주 구성으로 버티기', '갈리오 AP 아이템 필수', '메타덱에 밀리면 피봇 고려'],
    synergy: '선봉대 4 + 싸움꾼 3',
  },
];

// 메타 증강체 (Set 17)
export const META_AUGMENTS = [
  // S티어
  { name:'별돌보미의 선물', tier:'S' as Tier, avgPlace:3.5, pickRate:16.2 },
  { name:'N.O.V.A. 프로토콜', tier:'S' as Tier, avgPlace:3.6, pickRate:12.4 },
  { name:'전술가의 무기고', tier:'S' as Tier, avgPlace:3.7, pickRate:9.8 },
  { name:'이중 하강', tier:'S' as Tier, avgPlace:3.8, pickRate:7.3 },
  // A티어
  { name:'도전자의 기세', tier:'A' as Tier, avgPlace:4.0, pickRate:19.7 },
  { name:'정령의 가호', tier:'A' as Tier, avgPlace:4.1, pickRate:10.3 },
  { name:'암흑의 인장', tier:'A' as Tier, avgPlace:4.2, pickRate:8.9 },
  { name:'생명력 흡수', tier:'A' as Tier, avgPlace:4.2, pickRate:14.1 },
  { name:'그림자 강화', tier:'A' as Tier, avgPlace:4.3, pickRate:11.5 },
  { name:'고대의 힘', tier:'A' as Tier, avgPlace:4.3, pickRate:9.2 },
  // B티어
  { name:'재구름의 행운', tier:'B' as Tier, avgPlace:4.5, pickRate:22.1 },
  { name:'안정된 재정', tier:'B' as Tier, avgPlace:4.6, pickRate:18.5 },
  { name:'야생의 부름', tier:'B' as Tier, avgPlace:4.7, pickRate:13.4 },
  { name:'방어막 강화', tier:'B' as Tier, avgPlace:4.8, pickRate:10.7 },
  { name:'전략가', tier:'B' as Tier, avgPlace:4.9, pickRate:8.3 },
  // C티어
  { name:'절박한 도박', tier:'C' as Tier, avgPlace:5.1, pickRate:11.8 },
  { name:'이중 타격', tier:'C' as Tier, avgPlace:5.3, pickRate:9.4 },
  { name:'과부하', tier:'C' as Tier, avgPlace:5.5, pickRate:6.2 },
];
