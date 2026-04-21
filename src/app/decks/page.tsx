'use client';
import { useState } from "react";
import { DECKS, CHAMPIONS, TIER_COLORS, COST_COLORS, TRAIT_COLORS, TRAIT_LABELS } from "@/lib/tft-data";
import type { TraitKey, Tier, Cost } from "@/lib/tft-data";

function HexFrame({ name, cost, size = 40 }: { name: string; cost: Cost; size?: number }) {
  const color = COST_COLORS[cost];
  return (
    <div className="hex-outer" style={{ width: size, height: size, background: color }}>
      <div className="hex-inner" style={{ color, fontSize: size * 0.18, fontWeight: 700 }}>
        {name[0]}
      </div>
    </div>
  );
}

function TierBadge({ tier, large = false }: { tier: Tier; large?: boolean }) {
  const color = TIER_COLORS[tier];
  return (
    <span className={`tier-badge ${large ? 'lg' : ''}`} style={{
      color, borderColor: color,
      background: `linear-gradient(135deg, ${color}33, ${color}11)`,
      boxShadow: `0 0 10px ${color}44`,
    }}>{tier}</span>
  );
}

function TraitTag({ trait }: { trait: TraitKey }) {
  const color = TRAIT_COLORS[trait];
  return (
    <span className="trait-tag" style={{ color, background: `${color}15`, borderColor: `${color}44` }}>
      {TRAIT_LABELS[trait]}
    </span>
  );
}

export default function DecksPage() {
  const [tierFilter, setTierFilter] = useState<Tier|''>('');
  const [styleFilter, setStyleFilter] = useState<'재구름'|'고정'|''>('');
  const [selected, setSelected] = useState<number|null>(null);

  const filtered = DECKS.filter(d => {
    if (tierFilter && d.tier !== tierFilter) return false;
    if (styleFilter && d.style !== styleFilter) return false;
    return true;
  });

  const selectedDeck = selected !== null ? DECKS.find(d => d.id === selected) : null;

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <h1 style={{ fontFamily:'Cinzel,serif', fontSize:28, fontWeight:700, color:'var(--gold-2)', marginBottom:8 }}>
          덱 추천
        </h1>
        <p style={{ color:'var(--muted)', fontFamily:'Rajdhani,sans-serif', fontSize:15, marginBottom:32 }}>
          Season 17 Arcane Depths — 티어별 최강 덱 가이드
        </p>

        {/* 필터 */}
        <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:28 }}>
          {/* 티어 필터 */}
          <div style={{ display:'flex', gap:6 }}>
            <button onClick={() => setTierFilter('')} style={{
              padding:'5px 14px', borderRadius:3, cursor:'pointer',
              fontFamily:'Rajdhani,sans-serif', fontSize:13, fontWeight:600,
              background: tierFilter === '' ? 'var(--gold-3)' : 'var(--navy-2)',
              color: tierFilter === '' ? 'var(--gold)' : 'var(--muted)',
              border: `1px solid ${tierFilter === '' ? 'var(--border-hover)' : 'var(--border)'}`,
            }}>전체 티어</button>
            {(['S','A','B','C'] as Tier[]).map(t => {
              const color = TIER_COLORS[t];
              const active = tierFilter === t;
              return (
                <button key={t} onClick={() => setTierFilter(active ? '' : t)} style={{
                  padding:'5px 14px', borderRadius:3, cursor:'pointer',
                  fontFamily:'Cinzel,serif', fontSize:13, fontWeight:700,
                  background: active ? `${color}25` : 'var(--navy-2)',
                  color: active ? color : 'var(--muted)',
                  border: `1px solid ${active ? color+'66' : 'var(--border)'}`,
                }}>{t}</button>
              );
            })}
          </div>

          {/* 스타일 필터 */}
          <div style={{ display:'flex', gap:6 }}>
            {(['', '재구름', '고정'] as const).map(s => (
              <button key={s} onClick={() => setStyleFilter(s)} style={{
                padding:'5px 14px', borderRadius:3, cursor:'pointer',
                fontFamily:'Rajdhani,sans-serif', fontSize:13, fontWeight:600,
                background: styleFilter === s ? 'var(--gold-3)' : 'var(--navy-2)',
                color: styleFilter === s ? 'var(--gold)' : 'var(--muted)',
                border: `1px solid ${styleFilter === s ? 'var(--border-hover)' : 'var(--border)'}`,
              }}>{s === '' ? '전체 스타일' : s}</button>
            ))}
          </div>
        </div>

        {/* 덱 그리드 */}
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))',
          gap:12,
        }}>
          {filtered.map(deck => {
            const units = deck.unitIds.slice(0,8).map(id => CHAMPIONS.find(c => c.id === id)!).filter(Boolean);
            const tierColor = TIER_COLORS[deck.tier];
            return (
              <button
                key={deck.id}
                onClick={() => setSelected(deck.id)}
                style={{
                  background:'var(--navy-2)', border:`1px solid var(--border)`,
                  borderLeft:`3px solid ${tierColor}`,
                  borderRadius:6, padding:'16px',
                  cursor:'pointer', textAlign:'left',
                  transition:'all 0.2s',
                  boxShadow:'0 4px 12px rgba(0,0,0,0.3)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--navy-3)';
                  (e.currentTarget as HTMLElement).style.borderColor = tierColor + '99';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--navy-2)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLElement).style.transform = 'none';
                }}
              >
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                  <span style={{ fontFamily:'Cinzel,serif', fontSize:15, fontWeight:700, color:'var(--gold-2)' }}>
                    {deck.name}
                  </span>
                  <TierBadge tier={deck.tier} />
                </div>

                <div style={{ display:'flex', gap:6, marginBottom:10, flexWrap:'wrap', alignItems:'center' }}>
                  <span style={{
                    fontSize:10, fontFamily:'Rajdhani,sans-serif', fontWeight:600,
                    color:'var(--muted)', background:'var(--navy-4)',
                    padding:'2px 7px', borderRadius:2, letterSpacing:'0.06em',
                  }}>{deck.style}</span>
                  <span style={{
                    fontSize:10, fontFamily:'Rajdhani,sans-serif', fontWeight:600,
                    color:'var(--muted)', background:'var(--navy-4)',
                    padding:'2px 7px', borderRadius:2, letterSpacing:'0.06em',
                  }}>{deck.difficulty}</span>
                </div>

                <div style={{ display:'flex', gap:3, marginBottom:10, flexWrap:'wrap' }}>
                  {deck.traits.map(t => <TraitTag key={t} trait={t} />)}
                </div>

                <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:12 }}>
                  {units.map(u => <HexFrame key={u.id} name={u.name} cost={u.cost} size={34} />)}
                </div>

                <div className="gold-divider" style={{ margin:'8px 0' }}/>
                <div style={{ display:'flex', gap:16 }}>
                  {[
                    { label:'평균등수', val:`${deck.avgPlace}위` },
                    { label:'픽률', val:`${deck.playRate}%` },
                    { label:'1등률', val:`${deck.winRate}%` },
                  ].map(s => (
                    <div key={s.label}>
                      <div style={{ fontFamily:'Cinzel,serif', fontSize:15, fontWeight:700, color:'var(--gold)' }}>{s.val}</div>
                      <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'60px 0', color:'var(--muted)', fontFamily:'Rajdhani,sans-serif' }}>
            조건에 맞는 덱이 없습니다
          </div>
        )}
      </div>

      {/* 덱 상세 모달 */}
      {selectedDeck && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ borderBottom:'1px solid var(--border)', padding:'20px 24px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <TierBadge tier={selectedDeck.tier} large />
                  <div>
                    <div style={{ fontFamily:'Cinzel,serif', fontSize:20, fontWeight:700, color:'var(--gold-2)' }}>
                      {selectedDeck.name}
                    </div>
                    <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:12, color:'var(--muted)', marginTop:2 }}>
                      {selectedDeck.style} · {selectedDeck.difficulty}
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} style={{
                  background:'none', border:'1px solid var(--border)', borderRadius:4,
                  color:'var(--muted)', cursor:'pointer', padding:'6px 12px',
                  fontFamily:'Rajdhani,sans-serif', fontSize:13,
                }}>닫기</button>
              </div>
            </div>

            <div style={{ padding:'24px' }}>
              {/* 시너지 */}
              <div style={{ marginBottom:20 }}>
                <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:11, fontWeight:600, letterSpacing:'0.1em', color:'var(--muted)', textTransform:'uppercase', marginBottom:8 }}>핵심 시너지</div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
                  {selectedDeck.traits.map(t => <TraitTag key={t} trait={t} />)}
                  <span style={{ fontFamily:'Rajdhani,sans-serif', fontSize:13, color:'var(--gold)', marginLeft:4 }}>
                    {selectedDeck.synergy}
                  </span>
                </div>
              </div>

              {/* 유닛 */}
              <div style={{ marginBottom:20 }}>
                <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:11, fontWeight:600, letterSpacing:'0.1em', color:'var(--muted)', textTransform:'uppercase', marginBottom:8 }}>추천 유닛</div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {selectedDeck.unitIds.map(id => {
                    const champ = CHAMPIONS.find(c => c.id === id);
                    if (!champ) return null;
                    return (
                      <div key={id} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                        <HexFrame name={champ.name} cost={champ.cost} size={48} />
                        <span style={{ fontFamily:'Rajdhani,sans-serif', fontSize:10, color:'var(--muted)' }}>{champ.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 통계 */}
              <div style={{ display:'flex', gap:0, marginBottom:20, background:'var(--navy-3)', borderRadius:6, overflow:'hidden' }}>
                {[
                  { label:'평균 등수', val:`${selectedDeck.avgPlace}위` },
                  { label:'픽률', val:`${selectedDeck.playRate}%` },
                  { label:'1등률', val:`${selectedDeck.winRate}%` },
                ].map((s, i) => (
                  <div key={s.label} style={{
                    flex:1, padding:'16px', textAlign:'center',
                    borderRight: i < 2 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div style={{ fontFamily:'Cinzel,serif', fontSize:20, fontWeight:700, color:'var(--gold)', marginBottom:4 }}>{s.val}</div>
                    <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:11, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* 핵심 아이템 */}
              <div style={{ marginBottom:20 }}>
                <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:11, fontWeight:600, letterSpacing:'0.1em', color:'var(--muted)', textTransform:'uppercase', marginBottom:8 }}>핵심 아이템</div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {selectedDeck.coreItems.map(item => (
                    <span key={item} style={{
                      fontFamily:'Rajdhani,sans-serif', fontSize:12, fontWeight:600,
                      color:'var(--gold-2)', background:'var(--navy-4)',
                      border:'1px solid var(--border)', borderRadius:3, padding:'4px 10px',
                    }}>{item}</span>
                  ))}
                </div>
              </div>

              {/* 공략 팁 */}
              <div>
                <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:11, fontWeight:600, letterSpacing:'0.1em', color:'var(--muted)', textTransform:'uppercase', marginBottom:8 }}>공략 팁</div>
                <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:6 }}>
                  {selectedDeck.tips.map((tip, i) => (
                    <li key={i} style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                      <span style={{ color:'var(--gold)', fontFamily:'Cinzel,serif', fontSize:13, fontWeight:700, marginTop:1, flexShrink:0 }}>{i+1}.</span>
                      <span style={{ fontFamily:'Rajdhani,sans-serif', fontSize:14, color:'var(--text)', lineHeight:1.5 }}>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
