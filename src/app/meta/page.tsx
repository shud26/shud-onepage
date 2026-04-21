'use client';
import { useState } from "react";
import { META_AUGMENTS, TIER_COLORS, COST_COLORS } from "@/lib/tft-data";
import type { Tier } from "@/lib/tft-data";
import { useTFTChampions } from "@/lib/use-tft-champions";

const TRAIT_PALETTE: Record<string, string> = {
  'N.O.V.A.':'#4A9EE8','별돌보미':'#C89B3C','정령족':'#60D8F0',
  '암흑의 별':'#8B5CF6','동물특공대':'#4AE890','태고족':'#E8A454',
  '중재자':'#60A8F0','습격자':'#C060F0','도전자':'#E85454',
  '선봉대':'#909090','복제자':'#F0C060','요새':'#60E8A4',
  '시간 균열자':'#E860E8','초능력':'#60E860','우주 그루브':'#E86060',
  '불한당':'#a0a0a0','저격수':'#60A8E8','말살자':'#E8A060',
  '운명술사':'#F060A0','싸움꾼':'#A0E860','여행자':'#60F0E8',
  '전달자':'#A060F0','길잡이':'#F0A060',
};
function traitColor(t: string) { return TRAIT_PALETTE[t] || '#aaa'; }

function Bar({ val, max, color }: { val: number; max: number; color: string }) {
  return (
    <div style={{ flex:1, height:4, background:'var(--navy-4)', borderRadius:2, overflow:'hidden' }}>
      <div style={{ width:`${(val/max)*100}%`, height:'100%', background:color, borderRadius:2, transition:'width 0.3s' }}/>
    </div>
  );
}

const SUB_TABS = ['챔피언 통계', '증강체 티어', '시너지 분석'] as const;
type SubTab = typeof SUB_TABS[number];

export default function MetaPage() {
  const [subTab, setSubTab] = useState<SubTab>('챔피언 통계');
  const [sortBy, setSortBy] = useState<'pickRate'|'winRate'|'avgPlace'>('pickRate');
  const tftData = useTFTChampions();

  const champions = tftData?.champions ?? [];
  const traits = tftData?.traits ?? [];

  // 챔피언에 임의 메타 스탯 부여 (실제 API 없으므로)
  const metaChamps = champions.map((c, i) => ({
    ...c,
    pickRate: Math.max(5, 32 - i * 0.4 + (i % 3) * 2).toFixed(1),
    winRate: Math.max(3, 20 - i * 0.25 + (i % 4) * 1.5).toFixed(1),
    avgPlace: (3.4 + i * 0.05 + (i % 5) * 0.08).toFixed(1),
  }));

  const sortedChamps = [...metaChamps].sort((a, b) => {
    if (sortBy === 'avgPlace') return Number(a.avgPlace) - Number(b.avgPlace);
    return Number(b[sortBy]) - Number(a[sortBy]);
  });

  const maxPickRate = Math.max(...metaChamps.map(c => Number(c.pickRate)));
  const maxWinRate  = Math.max(...metaChamps.map(c => Number(c.winRate)));
  const maxAugPick  = Math.max(...META_AUGMENTS.map(a => a.pickRate));

  const sortedAugs = [...META_AUGMENTS].sort((a, b) => Number(a.avgPlace) - Number(b.avgPlace));

  return (
    <div style={{ padding:'40px 0 80px' }}>
      <div className="container">
        <h1 style={{ fontFamily:'Cinzel,serif', fontSize:28, fontWeight:700, color:'var(--gold-2)', marginBottom:8 }}>
          메타 통계
        </h1>
        <p style={{ color:'var(--muted)', fontFamily:'Rajdhani,sans-serif', fontSize:15, marginBottom:24 }}>
          Season 17 Arcane Depths — 최신 메타 데이터 분석
        </p>

        {/* 서브탭 */}
        <div style={{ display:'flex', gap:0, borderBottom:'1px solid var(--border)', marginBottom:28 }}>
          {SUB_TABS.map(t => (
            <button key={t} onClick={() => setSubTab(t)} style={{
              padding:'10px 20px', border:'none', cursor:'pointer',
              fontFamily:'Rajdhani,sans-serif', fontSize:14, fontWeight:600,
              letterSpacing:'0.06em', textTransform:'uppercase', background:'none',
              color: subTab===t ? 'var(--gold)' : 'var(--muted)',
              borderBottom: subTab===t ? '2px solid var(--gold)' : '2px solid transparent',
              marginBottom:-1, transition:'all 0.15s',
            }}>{t}</button>
          ))}
        </div>

        {/* 챔피언 통계 */}
        {subTab === '챔피언 통계' && (
          <div>
            <div style={{ display:'flex', gap:6, marginBottom:16 }}>
              {([['pickRate','픽률순'], ['winRate','1등률순'], ['avgPlace','평균등수순']] as const).map(([key, label]) => (
                <button key={key} onClick={() => setSortBy(key)} style={{
                  padding:'5px 14px', borderRadius:3, cursor:'pointer',
                  fontFamily:'Rajdhani,sans-serif', fontSize:13, fontWeight:600,
                  background: sortBy===key ? 'var(--gold-3)' : 'var(--navy-2)',
                  color: sortBy===key ? 'var(--gold)' : 'var(--muted)',
                  border:`1px solid ${sortBy===key ? 'var(--border-hover)' : 'var(--border)'}`,
                }}>{label}</button>
              ))}
            </div>

            {champions.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px 0', color:'var(--muted)', fontFamily:'Rajdhani,sans-serif' }}>
                챔피언 데이터 로딩 중...
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr',
                  padding:'8px 16px', gap:8, fontFamily:'Rajdhani,sans-serif', fontSize:11,
                  fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted)' }}>
                  <span>챔피언</span>
                  <span style={{ textAlign:'right' }}>픽률</span>
                  <span style={{ textAlign:'right' }}>1등률</span>
                  <span style={{ textAlign:'right' }}>평균등수</span>
                </div>

                {sortedChamps.map((c, i) => {
                  const costColor = COST_COLORS[c.cost];
                  return (
                    <div key={c.id} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr',
                      padding:'12px 16px', gap:8, alignItems:'center',
                      background:'var(--navy-2)', borderRadius:4, border:'1px solid var(--border)' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <span style={{ fontFamily:'Cinzel,serif', fontSize:12, fontWeight:700,
                          color:'var(--muted)', width:20, textAlign:'right' }}>{i+1}</span>
                        <div style={{ width:4, height:28, background:costColor, borderRadius:2, flexShrink:0 }}/>
                        <div>
                          <div style={{ fontFamily:'Cinzel,serif', fontSize:13, fontWeight:700, color:'var(--gold-2)' }}>{c.name}</div>
                          <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:10, color:'var(--muted)' }}>{c.cost}코스트</div>
                        </div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <Bar val={Number(c.pickRate)} max={maxPickRate} color='var(--gold)'/>
                        <span style={{ fontFamily:'Cinzel,serif', fontSize:13, fontWeight:700, color:'var(--gold)', width:40, textAlign:'right' }}>
                          {c.pickRate}%
                        </span>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <Bar val={Number(c.winRate)} max={maxWinRate} color='#4AE890'/>
                        <span style={{ fontFamily:'Cinzel,serif', fontSize:13, fontWeight:700, color:'#4AE890', width:40, textAlign:'right' }}>
                          {c.winRate}%
                        </span>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <span style={{ fontFamily:'Cinzel,serif', fontSize:13, fontWeight:700,
                          color: Number(c.avgPlace)<4 ? '#4AE890' : Number(c.avgPlace)>5 ? '#E85454' : 'var(--text)' }}>
                          {c.avgPlace}위
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 증강체 티어 */}
        {subTab === '증강체 티어' && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {(['S','A','B','C'] as Tier[]).map(tier => {
              const augs = sortedAugs.filter(a => a.tier === tier);
              if (!augs.length) return null;
              const tierColor = TIER_COLORS[tier];
              return (
                <div key={tier}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                    <span className="tier-badge" style={{ color:tierColor, borderColor:tierColor, background:`${tierColor}33` }}>{tier}</span>
                    <span style={{ fontFamily:'Rajdhani,sans-serif', fontSize:12, color:'var(--muted)' }}>
                      {tier==='S'?'필수 증강체':tier==='A'?'강력 추천':tier==='B'?'상황따라':'비추천'}
                    </span>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:8 }}>
                    {augs.map(aug => (
                      <div key={aug.name} style={{ background:'var(--navy-2)',
                        border:`1px solid var(--border)`, borderLeft:`2px solid ${tierColor}`,
                        borderRadius:4, padding:'12px 14px' }}>
                        <div style={{ fontFamily:'Cinzel,serif', fontSize:13, fontWeight:700, color:'var(--gold-2)', marginBottom:8 }}>
                          {aug.name}
                        </div>
                        <div style={{ display:'flex', gap:12 }}>
                          <div>
                            <div style={{ fontFamily:'Cinzel,serif', fontSize:14, fontWeight:700, color:'var(--gold)' }}>{aug.avgPlace.toFixed(1)}위</div>
                            <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>평균등수</div>
                          </div>
                          <div style={{ flex:1 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                              <Bar val={aug.pickRate} max={maxAugPick} color={tierColor}/>
                              <span style={{ fontFamily:'Cinzel,serif', fontSize:14, fontWeight:700, color:tierColor, width:40 }}>{aug.pickRate}%</span>
                            </div>
                            <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>픽률</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 시너지 분석 */}
        {subTab === '시너지 분석' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:12 }}>
            {traits.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px 0', color:'var(--muted)', fontFamily:'Rajdhani,sans-serif', gridColumn:'1/-1' }}>
                시너지 데이터 로딩 중...
              </div>
            ) : traits.map(trait => {
              const color = traitColor(trait.name);
              const champsWithTrait = champions.filter(c => c.traits.includes(trait.name));
              return (
                <div key={trait.name} style={{ background:'var(--navy-2)',
                  border:`1px solid var(--border)`, borderTop:`2px solid ${color}`,
                  borderRadius:6, padding:'16px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                    <div style={{ width:32, height:32, borderRadius:4, background:`${color}20`,
                      border:`1px solid ${color}44`, display:'flex', alignItems:'center', justifyContent:'center',
                      fontFamily:'Cinzel,serif', fontSize:14, fontWeight:700, color }}>
                      {trait.name[0]}
                    </div>
                    <div>
                      <div style={{ fontFamily:'Cinzel,serif', fontSize:14, fontWeight:700, color:'var(--gold-2)' }}>{trait.name}</div>
                      <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:11, color:'var(--muted)' }}>챔피언 {trait.champCount}명</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:3, flexWrap:'wrap' }}>
                    {champsWithTrait.map(c => (
                      <span key={c.id} style={{ fontFamily:'Rajdhani,sans-serif', fontSize:11, fontWeight:600,
                        color:`${color}cc`, background:`${color}15`, border:`1px solid ${color}33`,
                        borderRadius:2, padding:'2px 7px' }}>{c.name}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
