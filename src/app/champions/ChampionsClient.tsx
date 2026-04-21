'use client';
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { COST_COLORS } from "@/lib/tft-data";
import type { ApiChampion, ApiTrait } from "@/lib/tft-api";

function nameToSlug(name: string) { return encodeURIComponent(name); }

const COST_LABELS: Record<number, string> = { 1:'1코', 2:'2코', 3:'3코', 4:'4코', 5:'5코' };

// 시너지별 색상 (고정 팔레트 순환)
const TRAIT_PALETTE = [
  '#4A9EE8','#8B5CF6','#60D8F0','#E85454','#4AE890',
  '#C060F0','#60A8F0','#E8A454','#F0C060','#60E8A4',
  '#E86060','#60A8E8','#B060F0','#E8A060','#60E860',
];

function getTraitColor(traitName: string, allTraits: ApiTrait[]): string {
  const idx = allTraits.findIndex(t => t.name === traitName);
  return TRAIT_PALETTE[idx % TRAIT_PALETTE.length] ?? '#aaa';
}

function ChampCard({ champ, allTraits }: { champ: ApiChampion; allTraits: ApiTrait[] }) {
  const [flipped, setFlipped] = useState(false);
  const costColor = COST_COLORS[champ.cost as keyof typeof COST_COLORS];

  return (
    <button
      onClick={() => setFlipped(f => !f)}
      style={{
        background:'var(--navy-2)',
        border:`1px solid ${flipped ? costColor : 'var(--border)'}`,
        borderTop:`2px solid ${costColor}`,
        borderRadius:6, padding:'14px 12px',
        cursor:'pointer', transition:'all 0.2s',
        textAlign:'center',
        boxShadow: flipped ? `0 0 12px ${costColor}44` : '0 4px 12px rgba(0,0,0,0.3)',
        transform: flipped ? 'scale(1.02)' : 'none',
      }}
    >
      {/* 챔피언 이미지 or 이니셜 hex */}
      <div style={{ display:'flex', justifyContent:'center', marginBottom:8 }}>
        {champ.imageUrl ? (
          <div style={{
            width:70, height:70, borderRadius:4, overflow:'hidden',
            clipPath:'polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)',
            background: costColor, flexShrink:0,
          }}>
            <Image
              src={champ.imageUrl}
              alt={champ.name}
              width={70}
              height={70}
              style={{ objectFit:'cover', filter: flipped ? 'brightness(0.4)' : 'brightness(1)' }}
              unoptimized
            />
          </div>
        ) : (
          <div className="hex-outer" style={{ width:70, height:70, background:costColor }}>
            <div className="hex-inner" style={{ color:costColor, fontSize:70*0.18, fontWeight:700 }}>
              {flipped ? '?' : champ.name[0]}
            </div>
          </div>
        )}
      </div>

      {!flipped ? (
        <>
          <div style={{ fontFamily:'Cinzel,serif', fontSize:13, fontWeight:700, color:'var(--gold-2)', marginBottom:6 }}>
            {champ.name}
          </div>
          {/* 코스트 도트 */}
          <div style={{ display:'flex', gap:2, justifyContent:'center', marginBottom:6 }}>
            {Array.from({length:5}).map((_,i) => (
              <span key={i} style={{ width:8, height:8, borderRadius:'50%', background: i < champ.cost ? costColor : 'var(--navy-4)' }}/>
            ))}
          </div>
          {/* 시너지 태그 */}
          <div style={{ display:'flex', gap:3, flexWrap:'wrap', justifyContent:'center' }}>
            {champ.traits.map(t => {
              const color = getTraitColor(t, allTraits);
              return (
                <span key={t} className="trait-tag" style={{
                  color, background:`${color}15`, borderColor:`${color}44`,
                  fontSize:10, padding:'1px 6px',
                }}>{t}</span>
              );
            })}
          </div>
          <Link
            href={`/champions/${nameToSlug(champ.name)}`}
            onClick={e => e.stopPropagation()}
            style={{
              display:'inline-block', marginTop:8,
              fontFamily:'Rajdhani,sans-serif', fontSize:11, fontWeight:600,
              color: costColor, textDecoration:'none', letterSpacing:'0.06em',
              opacity:0.8,
            }}
          >상세 보기 →</Link>
        </>
      ) : (
        <div style={{ textAlign:'left' }}>
          <div style={{ fontFamily:'Cinzel,serif', fontSize:11, fontWeight:700, color:costColor, marginBottom:4 }}>
            {champ.skill || '—'}
          </div>
          <p style={{ fontFamily:'Rajdhani,sans-serif', fontSize:12, color:'var(--text)', lineHeight:1.6, marginBottom:8 }}>
            {champ.skillDesc || '—'}
          </p>
          <div style={{ display:'flex', gap:3, flexWrap:'wrap' }}>
            {champ.traits.map(t => {
              const color = getTraitColor(t, allTraits);
              return (
                <span key={t} className="trait-tag" style={{
                  color, background:`${color}15`, borderColor:`${color}44`,
                  fontSize:10, padding:'1px 6px',
                }}>{t}</span>
              );
            })}
          </div>
          <Link
            href={`/champions/${nameToSlug(champ.name)}`}
            onClick={e => e.stopPropagation()}
            style={{
              display:'inline-block', marginTop:10,
              fontFamily:'Rajdhani,sans-serif', fontSize:11, fontWeight:600,
              color: costColor, textDecoration:'none', letterSpacing:'0.06em',
              opacity:0.85,
            }}
          >상세 페이지 →</Link>
        </div>
      )}
    </button>
  );
}

interface Props {
  champions: ApiChampion[];
  traits: ApiTrait[];
}

export default function ChampionsClient({ champions, traits }: Props) {
  const [search, setSearch] = useState('');
  const [costFilter, setCostFilter] = useState<0|1|2|3|4|5>(0);
  const [traitFilter, setTraitFilter] = useState('');

  const filtered = champions.filter(c => {
    if (search && !c.name.includes(search)) return false;
    if (costFilter !== 0 && c.cost !== costFilter) return false;
    if (traitFilter && !c.traits.includes(traitFilter)) return false;
    return true;
  });

  return (
    <div style={{ padding:'40px 0 80px' }}>
      <div className="container">
        <h1 style={{ fontFamily:'Cinzel,serif', fontSize:28, fontWeight:700, color:'var(--gold-2)', marginBottom:8 }}>
          챔피언 도감
        </h1>
        <p style={{ color:'var(--muted)', fontFamily:'Rajdhani,sans-serif', fontSize:15, marginBottom:32 }}>
          Season 17 Arcane Depths — {champions.length}명 전체 챔피언 정보
        </p>

        {/* 필터 */}
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
                fontFamily:'Rajdhani,sans-serif', fontSize:14, outline:'none',
              }}
            />
          </div>

          {/* 코스트 필터 */}
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {([0,1,2,3,4,5] as const).map(c => (
              <button key={c} onClick={() => setCostFilter(c)} style={{
                padding:'5px 14px', borderRadius:3, border:'1px solid var(--border)',
                fontFamily:'Rajdhani,sans-serif', fontSize:13, fontWeight:600,
                cursor:'pointer', transition:'all 0.15s',
                background: costFilter === c
                  ? (c === 0 ? 'var(--gold)' : COST_COLORS[c as 1|2|3|4|5])
                  : 'var(--navy-2)',
                color: costFilter === c ? 'var(--navy-0)' : 'var(--muted)',
                borderColor: costFilter === c
                  ? (c === 0 ? 'var(--gold)' : COST_COLORS[c as 1|2|3|4|5])
                  : 'var(--border)',
              }}>
                {c === 0 ? 'ALL' : COST_LABELS[c]}
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
            {traits.map(t => {
              const color = getTraitColor(t.name, traits);
              const active = traitFilter === t.name;
              return (
                <button key={t.name} onClick={() => setTraitFilter(active ? '' : t.name)} style={{
                  padding:'4px 12px', borderRadius:2,
                  fontFamily:'Rajdhani,sans-serif', fontSize:12, fontWeight:600,
                  cursor:'pointer', transition:'all 0.15s',
                  background: active ? `${color}25` : 'var(--navy-2)',
                  color: active ? color : 'var(--muted)',
                  border:`1px solid ${active ? color+'66' : 'var(--border)'}`,
                }}>{t.name}</button>
              );
            })}
          </div>
        </div>

        {/* 그리드 */}
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))',
          gap:10,
        }}>
          {filtered.map(c => (
            <ChampCard key={c.id} champ={c} allTraits={traits} />
          ))}
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
