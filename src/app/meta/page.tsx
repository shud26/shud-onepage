'use client';
import { useState } from "react";
import { META_CHAMPS, META_AUGMENTS, TRAIT_COLORS, TRAIT_LABELS, COST_COLORS, TIER_COLORS } from "@/lib/tft-data";
import type { TraitKey, Tier } from "@/lib/tft-data";

function TierBadge({ tier }: { tier: Tier }) {
  const color = TIER_COLORS[tier];
  return (
    <span className="tier-badge" style={{
      color, borderColor: color,
      background: `linear-gradient(135deg, ${color}33, ${color}11)`,
    }}>{tier}</span>
  );
}

function Bar({ val, max, color }: { val: number; max: number; color: string }) {
  return (
    <div style={{ flex: 1, height: 4, background: 'var(--navy-4)', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ width: `${(val / max) * 100}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.3s' }} />
    </div>
  );
}

const SUB_TABS = ['챔피언 통계', '증강체 티어', '시너지 분석'] as const;
type SubTab = typeof SUB_TABS[number];

const ALL_TRAITS = Object.keys(TRAIT_LABELS) as TraitKey[];

export default function MetaPage() {
  const [subTab, setSubTab] = useState<SubTab>('챔피언 통계');
  const [sortBy, setSortBy] = useState<'pickRate'|'winRate'|'avgPlace'>('pickRate');

  const sortedChamps = [...META_CHAMPS].sort((a, b) => {
    if (sortBy === 'avgPlace') return Number(a.avgPlace) - Number(b.avgPlace);
    return Number(b[sortBy]) - Number(a[sortBy]);
  });

  const sortedAugs = [...META_AUGMENTS].sort((a, b) => Number(a.avgPlace) - Number(b.avgPlace));

  const maxPickRate = Math.max(...META_CHAMPS.map(c => Number(c.pickRate)));
  const maxWinRate = Math.max(...META_CHAMPS.map(c => Number(c.winRate)));
  const maxAugPick = Math.max(...META_AUGMENTS.map(a => a.pickRate));

  return (
    <div style={{ padding: '40px 0 80px' }}>
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
              letterSpacing:'0.06em', textTransform:'uppercase',
              background:'none',
              color: subTab === t ? 'var(--gold)' : 'var(--muted)',
              borderBottom: subTab === t ? '2px solid var(--gold)' : '2px solid transparent',
              marginBottom: -1,
              transition:'all 0.15s',
            }}>{t}</button>
          ))}
        </div>

        {/* 챔피언 통계 */}
        {subTab === '챔피언 통계' && (
          <div>
            {/* 정렬 */}
            <div style={{ display:'flex', gap:6, marginBottom:16 }}>
              {([['pickRate','픽률'], ['winRate','1등률'], ['avgPlace','평균등수']] as const).map(([key, label]) => (
                <button key={key} onClick={() => setSortBy(key)} style={{
                  padding:'5px 14px', borderRadius:3, cursor:'pointer',
                  fontFamily:'Rajdhani,sans-serif', fontSize:13, fontWeight:600,
                  background: sortBy === key ? 'var(--gold-3)' : 'var(--navy-2)',
                  color: sortBy === key ? 'var(--gold)' : 'var(--muted)',
                  border: `1px solid ${sortBy === key ? 'var(--border-hover)' : 'var(--border)'}`,
                }}>{label}순</button>
              ))}
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
              {/* 헤더 */}
              <div style={{
                display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr',
                padding:'8px 16px', gap:8,
                fontFamily:'Rajdhani,sans-serif', fontSize:11, fontWeight:600,
                letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted)',
              }}>
                <span>챔피언</span>
                <span style={{ textAlign:'right' }}>픽률</span>
                <span style={{ textAlign:'right' }}>1등률</span>
                <span style={{ textAlign:'right' }}>평균등수</span>
              </div>

              {sortedChamps.map((c, i) => {
                const costColor = COST_COLORS[c.cost];
                return (
                  <div key={c.id} style={{
                    display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr',
                    padding:'12px 16px', gap:8, alignItems:'center',
                    background:'var(--navy-2)', borderRadius:4,
                    border:'1px solid var(--border)',
                  }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{
                        fontFamily:'Cinzel,serif', fontSize:12, fontWeight:700,
                        color:'var(--muted)', width:20, textAlign:'right',
                      }}>{i+1}</span>
                      <div style={{
                        width:8, height:28, background:costColor, borderRadius:2, flexShrink:0,
                      }}/>
                      <div>
                        <div style={{ fontFamily:'Cinzel,serif', fontSize:13, fontWeight:700, color:'var(--gold-2)' }}>{c.name}</div>
                        <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:10, color:'var(--muted)' }}>{c.cost}코스트</div>
                      </div>
                    </div>

                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <Bar val={Number(c.pickRate)} max={maxPickRate} color='var(--gold)' />
                      <span style={{ fontFamily:'Cinzel,serif', fontSize:13, fontWeight:700, color:'var(--gold)', width:40, textAlign:'right' }}>
                        {c.pickRate}%
                      </span>
                    </div>

                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <Bar val={Number(c.winRate)} max={maxWinRate} color='#4AE890' />
                      <span style={{ fontFamily:'Cinzel,serif', fontSize:13, fontWeight:700, color:'#4AE890', width:40, textAlign:'right' }}>
                        {c.winRate}%
                      </span>
                    </div>

                    <div style={{ textAlign:'right' }}>
                      <span style={{
                        fontFamily:'Cinzel,serif', fontSize:13, fontWeight:700,
                        color: Number(c.avgPlace) < 4 ? '#4AE890' : Number(c.avgPlace) > 5 ? '#E85454' : 'var(--text)',
                      }}>{c.avgPlace}위</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 증강체 티어 */}
        {subTab === '증강체 티어' && (
          <div>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {(['S','A','B','C'] as Tier[]).map(tier => {
                const augs = sortedAugs.filter(a => a.tier === tier);
                if (augs.length === 0) return null;
                const tierColor = TIER_COLORS[tier];
                return (
                  <div key={tier}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                      <span className="tier-badge" style={{
                        color: tierColor, borderColor: tierColor,
                        background: `linear-gradient(135deg, ${tierColor}33, ${tierColor}11)`,
                      }}>{tier}</span>
                      <span style={{ fontFamily:'Rajdhani,sans-serif', fontSize:12, color:'var(--muted)' }}>
                        {tier === 'S' ? '필수 증강체' : tier === 'A' ? '강력 추천' : tier === 'B' ? '상황따라' : '비추천'}
                      </span>
                    </div>

                    <div style={{
                      display:'grid',
                      gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))',
                      gap:8,
                    }}>
                      {augs.map(aug => (
                        <div key={aug.name} style={{
                          background:'var(--navy-2)', border:`1px solid var(--border)`,
                          borderLeft:`2px solid ${tierColor}`,
                          borderRadius:4, padding:'12px 14px',
                        }}>
                          <div style={{ fontFamily:'Cinzel,serif', fontSize:13, fontWeight:700, color:'var(--gold-2)', marginBottom:8 }}>
                            {aug.name}
                          </div>
                          <div style={{ display:'flex', gap:12 }}>
                            <div>
                              <div style={{ fontFamily:'Cinzel,serif', fontSize:14, fontWeight:700, color:'var(--gold)' }}>{aug.avgPlace.toFixed(1)}위</div>
                              <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>평균등수</div>
                            </div>
                            <div>
                              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                                <Bar val={aug.pickRate} max={maxAugPick} color={tierColor} />
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
          </div>
        )}

        {/* 시너지 분석 */}
        {subTab === '시너지 분석' && (
          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))',
            gap:12,
          }}>
            {ALL_TRAITS.map(trait => {
              const color = TRAIT_COLORS[trait];
              const champsWithTrait = META_CHAMPS.filter(c => c.traits.includes(trait));
              const avgPlace = champsWithTrait.length > 0
                ? (champsWithTrait.reduce((s, c) => s + Number(c.avgPlace), 0) / champsWithTrait.length).toFixed(1)
                : '—';
              const avgPick = champsWithTrait.length > 0
                ? (champsWithTrait.reduce((s, c) => s + Number(c.pickRate), 0) / champsWithTrait.length).toFixed(1)
                : '—';
              return (
                <div key={trait} style={{
                  background:'var(--navy-2)', border:`1px solid var(--border)`,
                  borderTop:`2px solid ${color}`, borderRadius:6, padding:'16px',
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                    <div style={{
                      width:32, height:32, borderRadius:4,
                      background:`${color}20`, border:`1px solid ${color}44`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontFamily:'Cinzel,serif', fontSize:14, fontWeight:700, color,
                    }}>{TRAIT_LABELS[trait][0]}</div>
                    <div>
                      <div style={{ fontFamily:'Cinzel,serif', fontSize:14, fontWeight:700, color:'var(--gold-2)' }}>{TRAIT_LABELS[trait]}</div>
                      <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:11, color:'var(--muted)' }}>챔피언 {champsWithTrait.length}명</div>
                    </div>
                  </div>

                  <div style={{ display:'flex', gap:16, marginBottom:12 }}>
                    <div>
                      <div style={{ fontFamily:'Cinzel,serif', fontSize:16, fontWeight:700, color }}>{avgPlace}위</div>
                      <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>평균등수</div>
                    </div>
                    <div>
                      <div style={{ fontFamily:'Cinzel,serif', fontSize:16, fontWeight:700, color:'var(--gold)' }}>{avgPick}%</div>
                      <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>평균픽률</div>
                    </div>
                  </div>

                  <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                    {champsWithTrait.map(c => (
                      <span key={c.id} style={{
                        fontFamily:'Rajdhani,sans-serif', fontSize:11, fontWeight:600,
                        color:`${color}cc`, background:`${color}15`,
                        border:`1px solid ${color}33`,
                        borderRadius:2, padding:'2px 7px',
                      }}>{c.name}</span>
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
