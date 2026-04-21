import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { fetchTFTData } from "@/lib/tft-api";
import type { ApiChampion, ApiTrait } from "@/lib/tft-api";
import { COST_COLORS } from "@/lib/tft-data";

export const dynamic = 'force-dynamic';

// 한국어 이름 → URL slug 변환
function nameToSlug(name: string) {
  return encodeURIComponent(name);
}

// URL slug → 챔피언 찾기
function findChampBySlug(champions: ApiChampion[], slug: string) {
  const decoded = decodeURIComponent(slug);
  return champions.find(c => c.name === decoded || c.id === decoded);
}

// ─── generateStaticParams ────────────────────────────────────────────
export async function generateStaticParams() {
  const { champions } = await fetchTFTData();
  return champions.map(c => ({ slug: nameToSlug(c.name) }));
}

// ─── generateMetadata ────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { champions } = await fetchTFTData();
  const champ = findChampBySlug(champions, slug);
  if (!champ) return { title: '챔피언 없음' };

  const title = `${champ.name} — TFT 시즌 17 롤토체스 챔피언 정보`;
  const description = `${champ.name} (${champ.cost}코스트) — 시너지: ${champ.traits.join(', ')}. 스킬: ${champ.skill}. ${champ.skillDesc.slice(0, 80)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: champ.imageUrl ? [{ url: champ.imageUrl }] : [],
    },
    alternates: {
      canonical: `https://tftchess.com/champions/${nameToSlug(champ.name)}`,
    },
  };
}

// ─── 시너지 색상 팔레트 ───────────────────────────────────────────────
const TRAIT_PALETTE: Record<string, string> = {
  'N.O.V.A.':'#4A9EE8','별돌보미':'#C89B3C','정령족':'#60D8F0',
  '암흑의 별':'#8B5CF6','동물특공대':'#4AE890','태고족':'#E8A454',
  '중재자':'#60A8F0','습격자':'#C060F0','도전자':'#E85454',
  '선봉대':'#909090','복제자':'#F0C060','요새':'#60E8A4',
  '시간 균열자':'#E860E8','초능력':'#60E860','우주 그루브':'#E86060',
  '불한당':'#a0a0a0','저격수':'#60A8E8','말살자':'#E8A060',
  '운명술사':'#F060A0','싸움꾼':'#A0E860','여행자':'#60F0E8',
  '전달자':'#A060F0','길잡이':'#F0A060','파멸자':'#E84060',
  '보루':'#80C0FF','지휘관':'#FFC080','은하계 사냥꾼':'#80FFC0',
  '어둠의 여인':'#C080FF','최신상':'#FF8080','파티광':'#80FFFF',
  '신성 결투가':'#FFD700','메카':'#A0C0E0','구원자':'#E0A0C0',
  '기동총격여신':'#FF60A0','특성 선택':'#CCCCCC','예언자':'#D4A0FF',
};
function traitColor(t: string) { return TRAIT_PALETTE[t] || '#aaa'; }

// ─── 같은 시너지 챔피언 카드 ─────────────────────────────────────────
function MiniChampCard({ champ }: { champ: ApiChampion }) {
  const costColor = COST_COLORS[champ.cost];
  return (
    <Link href={`/champions/${nameToSlug(champ.name)}`} style={{ textDecoration:'none' }}>
      <div style={{
        display:'flex', flexDirection:'column', alignItems:'center', gap:6,
        padding:'10px 8px', borderRadius:6,
        background:'var(--navy-3)', border:'1px solid var(--border)',
        transition:'all 0.15s', cursor:'pointer', minWidth:72,
      }}>
        <div style={{
          width:52, height:52, flexShrink:0,
          clipPath:'polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)',
          background: costColor, overflow:'hidden',
        }}>
          {champ.imageUrl ? (
            <div style={{ width:'88%', height:'88%', margin:'6%',
              clipPath:'polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)',
              overflow:'hidden' }}>
              <Image src={champ.imageUrl} alt={champ.name} width={52} height={52}
                style={{ objectFit:'cover', width:'100%', height:'100%' }} unoptimized />
            </div>
          ) : (
            <div style={{ width:'88%', height:'88%', margin:'6%',
              clipPath:'polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)',
              background:'var(--navy-1)', display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily:'Cinzel,serif', fontSize:14, fontWeight:700, color:costColor }}>
              {champ.name[0]}
            </div>
          )}
        </div>
        <span style={{ fontFamily:'Rajdhani,sans-serif', fontSize:11, fontWeight:600,
          color:'var(--muted)', textAlign:'center', lineHeight:1.2 }}>{champ.name}</span>
        <span style={{ fontFamily:'Cinzel,serif', fontSize:10, color:costColor }}>{champ.cost}코</span>
      </div>
    </Link>
  );
}

// ─── 메인 페이지 ─────────────────────────────────────────────────────
export default async function ChampionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { champions, traits } = await fetchTFTData();
  const champ = findChampBySlug(champions, slug);

  if (!champ) return notFound();

  const costColor = COST_COLORS[champ.cost];
  const traitInfo: ApiTrait[] = champ.traits.map(t => traits.find(tr => tr.name === t) ?? { name: t, champCount: 0 });

  // 같은 시너지 가진 챔피언들
  const relatedMap: Record<string, ApiChampion[]> = {};
  for (const t of champ.traits) {
    relatedMap[t] = champions.filter(c => c.id !== champ.id && c.traits.includes(t));
  }

  // 비슷한 코스트 챔피언 (좌우 네비게이션)
  const sameCost = champions.filter(c => c.cost === champ.cost);
  const currentIdx = sameCost.findIndex(c => c.id === champ.id);
  const prevChamp = sameCost[currentIdx - 1];
  const nextChamp = sameCost[currentIdx + 1];

  // JSON-LD 구조화 데이터
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'GameCharacter',
    name: champ.name,
    description: `${champ.name} — TFT 시즌 17 롤토체스 ${champ.cost}코스트 챔피언. 시너지: ${champ.traits.join(', ')}`,
    url: `https://tftchess.com/champions/${nameToSlug(champ.name)}`,
    image: champ.imageUrl,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ padding:'40px 0 80px' }}>
        <div className="container">

          {/* 브레드크럼 */}
          <nav style={{ display:'flex', alignItems:'center', gap:8, marginBottom:24,
            fontFamily:'Rajdhani,sans-serif', fontSize:13, color:'var(--muted)' }}>
            <Link href="/" style={{ color:'var(--muted)', textDecoration:'none' }}>홈</Link>
            <span>/</span>
            <Link href="/champions" style={{ color:'var(--muted)', textDecoration:'none' }}>챔피언 도감</Link>
            <span>/</span>
            <span style={{ color:'var(--gold)' }}>{champ.name}</span>
          </nav>

          {/* 메인 카드 */}
          <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:32, marginBottom:40,
            background:'var(--navy-2)', border:'1px solid var(--border)',
            borderTop:`3px solid ${costColor}`, borderRadius:8, padding:'28px',
            flexWrap:'wrap' as const,
          }}>
            {/* 챔피언 이미지 */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
              <div style={{
                width:130, height:130,
                clipPath:'polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)',
                background: costColor, overflow:'hidden', flexShrink:0,
                boxShadow:`0 0 24px ${costColor}55`,
              }}>
                {champ.imageUrl ? (
                  <div style={{ width:'88%', height:'88%', margin:'6%',
                    clipPath:'polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)',
                    overflow:'hidden' }}>
                    <Image src={champ.imageUrl} alt={champ.name} width={130} height={130}
                      style={{ objectFit:'cover', width:'100%', height:'100%' }} unoptimized />
                  </div>
                ) : (
                  <div style={{ width:'88%', height:'88%', margin:'6%',
                    clipPath:'polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)',
                    background:'var(--navy-1)', display:'flex', alignItems:'center', justifyContent:'center',
                    fontFamily:'Cinzel,serif', fontSize:40, fontWeight:700, color:costColor }}>
                    {champ.name[0]}
                  </div>
                )}
              </div>
              {/* 코스트 도트 */}
              <div style={{ display:'flex', gap:4 }}>
                {Array.from({length:5}).map((_,i) => (
                  <div key={i} style={{ width:10, height:10, borderRadius:'50%',
                    background: i < champ.cost ? costColor : 'var(--navy-4)',
                    boxShadow: i < champ.cost ? `0 0 6px ${costColor}` : 'none',
                  }}/>
                ))}
              </div>
              <span style={{ fontFamily:'Rajdhani,sans-serif', fontSize:12, color:costColor, fontWeight:600,
                background:`${costColor}20`, border:`1px solid ${costColor}44`,
                padding:'2px 10px', borderRadius:3 }}>
                {champ.cost}코스트
              </span>
            </div>

            {/* 챔피언 정보 */}
            <div>
              <h1 style={{ fontFamily:'Cinzel,serif', fontSize:32, fontWeight:900,
                color:'var(--gold-2)', marginBottom:12, lineHeight:1 }}>{champ.name}</h1>

              {/* 시너지 태그 */}
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:20 }}>
                {champ.traits.map(t => {
                  const color = traitColor(t);
                  const info = traits.find(tr => tr.name === t);
                  return (
                    <span key={t} className="trait-tag" style={{
                      color, background:`${color}15`, borderColor:`${color}44`,
                      fontSize:13, padding:'4px 12px',
                    }}>
                      {t} {info ? `(${info.champCount}명)` : ''}
                    </span>
                  );
                })}
              </div>

              {/* 스킬 */}
              {champ.skill && (
                <div style={{ background:'var(--navy-3)', border:'1px solid var(--border)',
                  borderLeft:`3px solid ${costColor}`, borderRadius:6, padding:'16px', marginBottom:16 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                    <span style={{ fontFamily:'Cinzel,serif', fontSize:11, fontWeight:600,
                      letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted)' }}>스킬</span>
                    <div style={{ flex:1, height:1, background:'var(--border)' }}/>
                  </div>
                  <div style={{ fontFamily:'Cinzel,serif', fontSize:16, fontWeight:700, color:costColor, marginBottom:6 }}>
                    {champ.skill}
                  </div>
                  <p style={{ fontFamily:'Rajdhani,sans-serif', fontSize:14, color:'var(--text)', lineHeight:1.7, margin:0 }}>
                    {champ.skillDesc || '스킬 설명 준비 중'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 시너지별 같은 챔피언 */}
          {champ.traits.map(t => {
            const related = relatedMap[t];
            if (!related.length) return null;
            const color = traitColor(t);
            return (
              <div key={t} style={{ marginBottom:32 }}>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
                  <div style={{ width:10, height:10, borderRadius:'50%', background:color, flexShrink:0,
                    boxShadow:`0 0 8px ${color}` }}/>
                  <h2 style={{ fontFamily:'Cinzel,serif', fontSize:16, fontWeight:700,
                    color, margin:0 }}>{t}</h2>
                  <span style={{ fontFamily:'Rajdhani,sans-serif', fontSize:12, color:'var(--muted)' }}>
                    시너지 챔피언 {related.length + 1}명
                  </span>
                  <div className="gold-divider" style={{ flex:1, margin:0 }}/>
                </div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {related.map(c => <MiniChampCard key={c.id} champ={c} />)}
                </div>
              </div>
            );
          })}

          {/* 이전/다음 챔피언 네비게이션 */}
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:40,
            borderTop:'1px solid var(--border)', paddingTop:24, gap:12 }}>
            {prevChamp ? (
              <Link href={`/champions/${nameToSlug(prevChamp.name)}`} style={{
                display:'flex', alignItems:'center', gap:10, textDecoration:'none',
                padding:'12px 16px', borderRadius:6,
                background:'var(--navy-2)', border:'1px solid var(--border)',
                transition:'all 0.15s',
              }}>
                <span style={{ color:'var(--muted)', fontSize:18 }}>←</span>
                <div>
                  <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:10, color:'var(--muted)',
                    textTransform:'uppercase', letterSpacing:'0.08em' }}>이전</div>
                  <div style={{ fontFamily:'Cinzel,serif', fontSize:14, fontWeight:700, color:'var(--gold-2)' }}>
                    {prevChamp.name}
                  </div>
                </div>
              </Link>
            ) : <div/>}

            <Link href="/champions" style={{
              display:'flex', alignItems:'center', gap:6, textDecoration:'none',
              padding:'12px 20px', borderRadius:6,
              background:'var(--gold-3)', border:'1px solid var(--border-hover)',
              fontFamily:'Rajdhani,sans-serif', fontSize:13, fontWeight:600, color:'var(--gold)',
            }}>
              전체 도감
            </Link>

            {nextChamp ? (
              <Link href={`/champions/${nameToSlug(nextChamp.name)}`} style={{
                display:'flex', alignItems:'center', gap:10, textDecoration:'none',
                padding:'12px 16px', borderRadius:6,
                background:'var(--navy-2)', border:'1px solid var(--border)',
                transition:'all 0.15s',
              }}>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:10, color:'var(--muted)',
                    textTransform:'uppercase', letterSpacing:'0.08em' }}>다음</div>
                  <div style={{ fontFamily:'Cinzel,serif', fontSize:14, fontWeight:700, color:'var(--gold-2)' }}>
                    {nextChamp.name}
                  </div>
                </div>
                <span style={{ color:'var(--muted)', fontSize:18 }}>→</span>
              </Link>
            ) : <div/>}
          </div>

        </div>
      </div>
    </>
  );
}
