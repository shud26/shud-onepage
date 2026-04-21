'use client';
import { useState } from "react";
import { CHAMPIONS, COST_COLORS, TRAIT_COLORS, TRAIT_LABELS } from "@/lib/tft-data";
import type { TraitKey, Cost } from "@/lib/tft-data";

function HexFrame({ name, cost, size = 70, flipped = false }: { name: string; cost: Cost; size?: number; flipped?: boolean }) {
  const color = COST_COLORS[cost];
  return (
    <div className="hex-outer" style={{ width: size, height: size, background: color }}>
      <div className="hex-inner" style={{ color, fontSize: size * 0.18, fontWeight: 700 }}>
        {flipped ? '?' : name[0]}
      </div>
    </div>
  );
}

function TraitTag({ trait, small = false }: { trait: TraitKey; small?: boolean }) {
  const color = TRAIT_COLORS[trait];
  return (
    <span className="trait-tag" style={{
      color, background: `${color}15`, borderColor: `${color}44`,
      fontSize: small ? 10 : 11, padding: small ? '1px 6px' : '2px 9px',
    }}>
      {TRAIT_LABELS[trait]}
    </span>
  );
}

const ALL_TRAITS = Object.keys(TRAIT_LABELS) as TraitKey[];

export default function ChampionsPage() {
  const [search, setSearch] = useState('');
  const [costFilter, setCostFilter] = useState<0|Cost>(0);
  const [traitFilter, setTraitFilter] = useState<TraitKey|''>('');
  const [flipped, setFlipped] = useState<number|null>(null);

  const filtered = CHAMPIONS.filter(c => {
    if (search && !c.name.includes(search)) return false;
    if (costFilter !== 0 && c.cost !== costFilter) return false;
    if (traitFilter && !c.traits.includes(traitFilter)) return false;
    return true;
  });

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <h1 style={{ fontFamily:'Cinzel,serif', fontSize:28, fontWeight:700, color:'var(--gold-2)', marginBottom:8 }}>
          챔피언 도감
        </h1>
        <p style={{ color:'var(--muted)', fontFamily:'Rajdhani,sans-serif', fontSize:15, marginBottom:32 }}>
          Season 17 Arcane Depths — 전체 챔피언 정보
        </p>

        {/* 필터 바 */}
        <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:28 }}>
          {/* 검색 */}
          <div style={{ position:'relative', maxWidth:320 }}>
            <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--muted)', fontSize:14 }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="챔피언 검색..."
              style={{
                width:'100%', padding:'10px 12px 10px 36px',
                background:'var(--navy-2)', border:'1px solid var(--border)',
                borderRadius:6, color:'var(--text)',
                fontFamily:'Rajdhani,sans-serif', fontSize:14,
                outline:'none',
              }}
            />
          </div>

          {/* 코스트 필터 */}
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {([0,1,2,3,4,5] as const).map(c => (
              <button key={c} onClick={() => setCostFilter(c as 0|Cost)} style={{
                padding:'5px 14px', borderRadius:3, border:'1px solid var(--border)',
                fontFamily:'Rajdhani,sans-serif', fontSize:13, fontWeight:600,
                cursor:'pointer', transition:'all 0.15s',
                background: costFilter === c
                  ? (c === 0 ? 'var(--gold)' : `${COST_COLORS[c as Cost]}`)
                  : 'var(--navy-2)',
                color: costFilter === c ? 'var(--navy-0)' : 'var(--muted)',
                borderColor: costFilter === c
                  ? (c === 0 ? 'var(--gold)' : COST_COLORS[c as Cost])
                  : 'var(--border)',
              }}>
                {c === 0 ? 'ALL' : `${c}코`}
              </button>
            ))}
          </div>

          {/* 시너지 필터 */}
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            <button onClick={() => setTraitFilter('')} style={{
              padding:'4px 12px', borderRadius:2,
              fontFamily:'Rajdhani,sans-serif', fontSize:12, fontWeight:600,
              cursor:'pointer', border:'1px solid var(--border)',
              background: traitFilter === '' ? 'var(--gold-3)' : 'var(--navy-2)',
              color: traitFilter === '' ? 'var(--gold)' : 'var(--muted)',
              borderColor: traitFilter === '' ? 'var(--border-hover)' : 'var(--border)',
            }}>전체</button>
            {ALL_TRAITS.map(t => {
              const color = TRAIT_COLORS[t];
              const active = traitFilter === t;
              return (
                <button key={t} onClick={() => setTraitFilter(active ? '' : t)} style={{
                  padding:'4px 12px', borderRadius:2,
                  fontFamily:'Rajdhani,sans-serif', fontSize:12, fontWeight:600,
                  cursor:'pointer', transition:'all 0.15s',
                  background: active ? `${color}25` : 'var(--navy-2)',
                  color: active ? color : 'var(--muted)',
                  border: `1px solid ${active ? color+'66' : 'var(--border)'}`,
                }}>{TRAIT_LABELS[t]}</button>
              );
            })}
          </div>
        </div>

        {/* 챔피언 그리드 */}
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))',
          gap:10,
        }}>
          {filtered.map(c => {
            const isFlipped = flipped === c.id;
            const costColor = COST_COLORS[c.cost];
            return (
              <button
                key={c.id}
                onClick={() => setFlipped(isFlipped ? null : c.id)}
                style={{
                  background:'var(--navy-2)', border:`1px solid ${isFlipped ? costColor : 'var(--border)'}`,
                  borderTop:`2px solid ${costColor}`,
                  borderRadius:6, padding:'14px 12px',
                  cursor:'pointer', transition:'all 0.2s',
                  textAlign:'center',
                  boxShadow: isFlipped ? `0 0 12px ${costColor}44` : '0 4px 12px rgba(0,0,0,0.3)',
                  transform: isFlipped ? 'scale(1.02)' : 'none',
                }}
              >
                <div style={{ display:'flex', justifyContent:'center', marginBottom:8 }}>
                  <HexFrame name={c.name} cost={c.cost} size={70} flipped={isFlipped} />
                </div>

                {!isFlipped ? (
                  <>
                    <div style={{ fontFamily:'Cinzel,serif', fontSize:13, fontWeight:700, color:'var(--gold-2)', marginBottom:6 }}>
                      {c.name}
                    </div>
                    <div style={{ display:'flex', gap:2, justifyContent:'center', marginBottom:6 }}>
                      {Array.from({length:5}).map((_,i) => (
                        <span key={i} style={{ width:8, height:8, borderRadius:'50%', background: i < c.cost ? costColor : 'var(--navy-4)' }}/>
                      ))}
                    </div>
                    <div style={{ display:'flex', gap:3, flexWrap:'wrap', justifyContent:'center' }}>
                      {c.traits.map(t => <TraitTag key={t} trait={t} small />)}
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign:'left' }}>
                    <div style={{ fontFamily:'Cinzel,serif', fontSize:11, fontWeight:700, color:costColor, marginBottom:4 }}>
                      {c.skill}
                    </div>
                    <p style={{ fontFamily:'Rajdhani,sans-serif', fontSize:12, color:'var(--text)', lineHeight:1.6, marginBottom:8 }}>
                      {c.skillDesc}
                    </p>
                    <div style={{ display:'flex', gap:3, flexWrap:'wrap' }}>
                      {c.traits.map(t => <TraitTag key={t} trait={t} small />)}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'60px 0', color:'var(--muted)', fontFamily:'Rajdhani,sans-serif' }}>
            검색 결과가 없습니다
          </div>
        )}
      </div>
    </div>
  );
}
