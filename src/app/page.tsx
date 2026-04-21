'use client';
import Link from "next/link";
import { DECKS, CHAMPIONS, TIER_COLORS, COST_COLORS, TRAIT_COLORS, TRAIT_LABELS } from "@/lib/tft-data";
import type { TraitKey } from "@/lib/tft-data";

const STATS = [
  { num: '58', label: '챔피언' },
  { num: '24', label: '덱 추천' },
  { num: '127', label: '증강체' },
  { num: '9', label: '기본 아이템' },
  { num: '17', label: '시즌' },
];

const TRAITS: { key: TraitKey; count: number }[] = [
  { key:'piltover', count:6 }, { key:'shadow',   count:5 },
  { key:'freljord', count:5 }, { key:'noxus',    count:4 },
  { key:'ionian',   count:4 }, { key:'void',     count:5 },
  { key:'mage',     count:6 }, { key:'warrior',  count:7 },
];

function HexFrame({ name, cost, size = 40 }: { name: string; cost: number; size?: number }) {
  const color = COST_COLORS[cost as keyof typeof COST_COLORS];
  return (
    <div className="hex-outer" style={{ width: size, height: size, background: color }}>
      <div className="hex-inner" style={{ color, fontSize: size * 0.18 }}>
        {name[0]}
      </div>
    </div>
  );
}

function TierBadge({ tier, large = false }: { tier: string; large?: boolean }) {
  const color = TIER_COLORS[tier as keyof typeof TIER_COLORS] || '#fff';
  return (
    <span
      className={`tier-badge ${large ? 'lg' : ''}`}
      style={{
        color,
        borderColor: color,
        background: `linear-gradient(135deg, ${color}33, ${color}11)`,
        boxShadow: `0 0 10px ${color}44`,
      }}
    >
      {tier}
    </span>
  );
}

function TraitTag({ trait }: { trait: TraitKey }) {
  const color = TRAIT_COLORS[trait];
  return (
    <span
      className="trait-tag"
      style={{ color, background: `${color}15`, borderColor: `${color}44` }}
    >
      {TRAIT_LABELS[trait]}
    </span>
  );
}

export default function HomePage() {
  const topDecks = DECKS.filter(d => d.tier === 'S' || d.tier === 'A').slice(0, 5);

  return (
    <div>
      {/* ── 히어로 ── */}
      <section style={{
        background: 'linear-gradient(160deg, #0a1a38 0%, #050b18 50%, #0d0a24 100%)',
        padding: '80px 24px 60px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* 배경 글로우 오브 */}
        <div style={{
          position:'absolute', top:-100, left:'30%',
          width:400, height:400, borderRadius:'50%',
          background:'radial-gradient(circle, rgba(200,155,60,0.08) 0%, transparent 70%)',
          pointerEvents:'none',
        }}/>
        <div style={{
          position:'absolute', bottom:-80, right:'10%',
          width:300, height:300, borderRadius:'50%',
          background:'radial-gradient(circle, rgba(75,60,200,0.08) 0%, transparent 70%)',
          pointerEvents:'none',
        }}/>

        <div className="container fade-up">
          {/* LIVE 뱃지 */}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
            <div style={{
              width:8, height:8, borderRadius:'50%',
              background:'var(--gold)',
              boxShadow:'0 0 8px var(--gold)',
              animation:'glowPulse 1.5s ease-in-out infinite',
            }}/>
            <span style={{
              fontFamily:'Rajdhani,sans-serif', fontSize:12,
              fontWeight:600, letterSpacing:'0.12em',
              color:'var(--gold)', textTransform:'uppercase',
            }}>
              SEASON 17 LIVE
            </span>
          </div>

          <h1 style={{
            fontFamily:'Cinzel,serif',
            fontSize:'clamp(32px,5vw,68px)',
            fontWeight:900,
            color:'var(--gold-2)',
            lineHeight:1.1,
            marginBottom:20,
            letterSpacing:'0.02em',
          }}>
            ARCANE{' '}
            <span style={{
              background:'linear-gradient(90deg, #C89B3C, #F0E6C0, #C89B3C)',
              backgroundSize:'200% auto',
              WebkitBackgroundClip:'text',
              WebkitTextFillColor:'transparent',
              backgroundClip:'text',
              animation:'shimmer 3s linear infinite',
            }}>
              DEPTHS
            </span>
          </h1>

          <p style={{
            fontFamily:'Rajdhani,sans-serif',
            fontSize:18, fontWeight:500,
            color:'var(--muted)',
            maxWidth:480, marginBottom:32, lineHeight:1.6,
          }}>
            시즌 17 아케인 심연 — 챔피언 도감, 최강 덱 추천, 실시간 메타 통계를 한 곳에서.
          </p>

          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <Link href="/decks" className="btn-primary">덱 추천 보기</Link>
            <Link href="/champions" className="btn-secondary">챔피언 도감</Link>
          </div>
        </div>
      </section>

      {/* ── 통계 스트립 ── */}
      <div style={{ background:'var(--navy-1)', borderBottom:'1px solid var(--border)' }}>
        <div className="container" style={{ display:'flex', flexWrap:'wrap' }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{
              flex:'1 1 120px',
              padding:'18px 24px',
              borderRight: i < STATS.length-1 ? '1px solid var(--border)' : 'none',
              textAlign:'center',
            }}>
              <div style={{
                fontFamily:'Cinzel,serif', fontSize:22, fontWeight:700,
                color:'var(--gold)', marginBottom:4,
              }}>{s.num}</div>
              <div style={{
                fontFamily:'Rajdhani,sans-serif', fontSize:11,
                fontWeight:600, letterSpacing:'0.1em',
                textTransform:'uppercase', color:'var(--muted)',
              }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 인기 덱 TOP 5 ── */}
      <section style={{ padding:'48px 0' }}>
        <div className="container">
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
            <span className="section-label">인기 덱 TOP 5</span>
            <div className="gold-divider" style={{ flex:1, margin:0 }}/>
            <Link href="/decks" style={{
              fontFamily:'Rajdhani,sans-serif', fontSize:13,
              color:'var(--gold)', textDecoration:'none', fontWeight:600,
            }}>전체 보기 →</Link>
          </div>

          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))',
            gap:12,
          }}>
            {topDecks.map(deck => {
              const units = deck.unitIds.slice(0,8).map(id => CHAMPIONS.find(c => c.id === id)!).filter(Boolean);
              return (
                <Link key={deck.id} href="/decks" style={{ textDecoration:'none' }}>
                  <div className="tft-card" style={{ borderLeft:`3px solid ${TIER_COLORS[deck.tier]}` }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                      <span style={{
                        fontFamily:'Cinzel,serif', fontSize:15, fontWeight:700,
                        color:'var(--gold-2)',
                      }}>{deck.name}</span>
                      <TierBadge tier={deck.tier} />
                    </div>
                    <div style={{ display:'flex', gap:4, marginBottom:10, flexWrap:'wrap' }}>
                      {deck.traits.map(t => <TraitTag key={t} trait={t} />)}
                    </div>
                    <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:12 }}>
                      {units.map(u => <HexFrame key={u.id} name={u.name} cost={u.cost} size={36} />)}
                    </div>
                    <div className="gold-divider" style={{ margin:'8px 0' }}/>
                    <div style={{ display:'flex', gap:16 }}>
                      {[
                        { label:'평균등수', val:`${deck.avgPlace}위` },
                        { label:'픽률',     val:`${deck.playRate}%` },
                        { label:'1등률',    val:`${deck.winRate}%` },
                      ].map(s => (
                        <div key={s.label}>
                          <div style={{ fontFamily:'Cinzel,serif', fontSize:15, fontWeight:700, color:'var(--gold)' }}>{s.val}</div>
                          <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 시너지 일람 ── */}
      <section style={{ padding:'0 0 60px' }}>
        <div className="container">
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
            <span className="section-label">시너지 일람</span>
            <div className="gold-divider" style={{ flex:1, margin:0 }}/>
          </div>
          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))',
            gap:10,
          }}>
            {TRAITS.map(t => {
              const color = TRAIT_COLORS[t.key];
              return (
                <div key={t.key} className="tft-card" style={{ borderTop:`2px solid ${color}` }}>
                  <div style={{
                    width:32, height:32, borderRadius:4,
                    background:`${color}20`, border:`1px solid ${color}44`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontFamily:'Cinzel,serif', fontSize:14, fontWeight:700,
                    color, marginBottom:8,
                  }}>
                    {TRAIT_LABELS[t.key][0]}
                  </div>
                  <div style={{ fontFamily:'Cinzel,serif', fontSize:13, fontWeight:700, color:'var(--gold-2)', marginBottom:4 }}>
                    {TRAIT_LABELS[t.key]}
                  </div>
                  <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:11, color:'var(--muted)' }}>
                    챔피언 {t.count}명
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
