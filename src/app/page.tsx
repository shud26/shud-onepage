'use client';
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { DECKS, TIER_COLORS, COST_COLORS, META_AUGMENTS } from "@/lib/tft-data";
import type { Tier } from "@/lib/tft-data";
import { useTFTChampions, getChampByApi } from "@/lib/use-tft-champions";
import { supabase } from "@/lib/supabase";

const STATS = [
  { num: '63', label: '챔피언' },
  { num: '10', label: '추천 덱' },
  { num: '44', label: '시너지' },
  { num: '10', label: '공략 가이드' },
  { num: '17', label: '시즌' },
];

function ChampHex({ apiName, size = 36 }: { apiName: string; size?: number }) {
  const data = useTFTChampions();
  const champ = data ? getChampByApi(data.champions, apiName) : undefined;
  const costColor = champ ? COST_COLORS[champ.cost] : '#555';

  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      clipPath: 'polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)',
      background: costColor, overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {champ?.imageUrl ? (
        <div style={{
          width: '88%', height: '88%',
          clipPath: 'polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)',
          overflow: 'hidden', position: 'relative',
        }}>
          <Image src={champ.imageUrl} alt={champ.name} width={size} height={size}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }} unoptimized />
        </div>
      ) : (
        <div style={{
          width: '88%', height: '88%',
          clipPath: 'polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)',
          background: 'linear-gradient(135deg, #142035, #050b18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Cinzel,serif', fontSize: size * 0.22, fontWeight: 700, color: costColor,
        }}>
          {champ ? champ.name[0] : '?'}
        </div>
      )}
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

// 시너지별 고정 색상
const TRAIT_PALETTE: Record<string, string> = {
  'N.O.V.A.':    '#4A9EE8',
  '별돌보미':    '#C89B3C',
  '정령족':      '#60D8F0',
  '암흑의 별':   '#8B5CF6',
  '동물특공대':  '#4AE890',
  '태고족':      '#E8A454',
  '중재자':      '#60A8F0',
  '습격자':      '#C060F0',
  '도전자':      '#E85454',
  '선봉대':      '#909090',
  '복제자':      '#F0C060',
  '요새':        '#60E8A4',
  '시간 균열자': '#E860E8',
  '초능력':      '#60E860',
  '우주 그루브': '#E86060',
  '불한당':      '#a0a0a0',
  '저격수':      '#60A8E8',
  '말살자':      '#E8A060',
};
function traitColor(t: string) { return TRAIT_PALETTE[t] || '#aaa'; }

function TraitTag({ trait }: { trait: string }) {
  const color = traitColor(trait);
  return (
    <span className="trait-tag" style={{ color, background: `${color}15`, borderColor: `${color}44` }}>
      {trait}
    </span>
  );
}

interface Tip {
  id: string;
  nickname: string;
  content: string;
  created_at: string;
  likes: number;
}

function CommunitySection() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [nickname, setNickname] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    supabase
      .from('tft_tips')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => { if (data) setTips(data); });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    const { data } = await supabase.from('tft_tips').insert({
      nickname: nickname.trim() || '익명의 소환사',
      content: content.trim(),
      likes: 0,
    }).select().single();
    if (data) {
      setTips(prev => [data, ...prev].slice(0, 10));
      setContent('');
      setNickname('');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }
    setSubmitting(false);
  }

  async function handleLike(id: string, currentLikes: number) {
    await supabase.from('tft_tips').update({ likes: currentLikes + 1 }).eq('id', id);
    setTips(prev => prev.map(t => t.id === id ? { ...t, likes: currentLikes + 1 } : t));
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return '방금 전';
    if (m < 60) return `${m}분 전`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}시간 전`;
    return `${Math.floor(h / 24)}일 전`;
  }

  return (
    <section style={{ padding: '0 0 60px' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <span className="section-label">공략 팁 공유</span>
          <div className="gold-divider" style={{ flex: 1, margin: 0 }} />
        </div>

        {/* 작성 폼 */}
        <form onSubmit={handleSubmit} style={{
          background: 'var(--navy-2)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '16px',
          marginBottom: 16,
        }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="닉네임 (선택)"
              maxLength={20}
              style={{
                width: 140, flexShrink: 0,
                background: 'var(--navy-3)', border: '1px solid var(--border)',
                borderRadius: 4, padding: '8px 12px',
                fontFamily: "'Noto Sans KR',sans-serif", fontSize: 13,
                color: 'var(--text)', outline: 'none',
              }}
            />
            <input
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="TFT 공략 팁을 공유해보세요! (예: 레벨 7에서 리롤하면 4코 챔피언 잘 나와요)"
              maxLength={200}
              style={{
                flex: 1,
                background: 'var(--navy-3)', border: '1px solid var(--border)',
                borderRadius: 4, padding: '8px 12px',
                fontFamily: "'Noto Sans KR',sans-serif", fontSize: 13,
                color: 'var(--text)', outline: 'none',
              }}
            />
            <button type="submit" disabled={submitting || !content.trim()} style={{
              background: content.trim() ? 'var(--gold)' : 'var(--navy-4)',
              border: 'none', borderRadius: 4, padding: '8px 18px',
              fontFamily: "'Bebas Neue',sans-serif", fontSize: 15,
              color: content.trim() ? '#050b18' : 'var(--muted)',
              cursor: content.trim() ? 'pointer' : 'default',
              letterSpacing: '0.05em', flexShrink: 0,
              transition: 'background 0.15s',
            }}>
              {submitting ? '...' : '공유'}
            </button>
          </div>
          {submitted && (
            <div style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 12, color: '#4AE890' }}>
              팁이 등록됐습니다!
            </div>
          )}
        </form>

        {/* 팁 목록 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tips.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0', fontFamily: "'Noto Sans KR',sans-serif", fontSize: 14, color: 'var(--muted)' }}>
              첫 번째 팁을 공유해보세요!
            </div>
          )}
          {tips.map(tip => (
            <div key={tip.id} style={{
              background: 'var(--navy-2)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '12px 16px',
              display: 'flex', alignItems: 'flex-start', gap: 12,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: 'var(--navy-4)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, color: 'var(--gold)',
              }}>
                {tip.nickname[0]?.toUpperCase() ?? '?'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--gold-2)' }}>
                    {tip.nickname}
                  </span>
                  <span style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 11, color: 'var(--muted)' }}>
                    {timeAgo(tip.created_at)}
                  </span>
                </div>
                <p style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 14, color: '#c8bfa8', margin: 0, lineHeight: 1.6 }}>
                  {tip.content}
                </p>
              </div>
              <button onClick={() => handleLike(tip.id, tip.likes)} style={{
                background: 'none', border: '1px solid var(--border)',
                borderRadius: 4, padding: '4px 10px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
              }}>
                <span style={{ fontSize: 13 }}>👍</span>
                <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 13, color: 'var(--gold)' }}>{tip.likes}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const topDecks = DECKS.filter(d => d.tier === 'S' || d.tier === 'A').slice(0, 5);

  return (
    <div>
      {/* ── 히어로 ── */}
      <section style={{
        background: 'linear-gradient(160deg, #0a1a38 0%, #050b18 50%, #0d0a24 100%)',
        padding: '80px 24px 60px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', top:-100, left:'30%', width:400, height:400, borderRadius:'50%',
          background:'radial-gradient(circle, rgba(200,155,60,0.08) 0%, transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:-80, right:'10%', width:300, height:300, borderRadius:'50%',
          background:'radial-gradient(circle, rgba(75,60,200,0.08) 0%, transparent 70%)', pointerEvents:'none' }}/>

        <div className="container fade-up">
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--gold)',
              boxShadow:'0 0 8px var(--gold)', animation:'glowPulse 1.5s ease-in-out infinite' }}/>
            <span style={{ fontFamily:"'Noto Sans KR',sans-serif", fontSize:12, fontWeight:600,
              letterSpacing:'0.12em', color:'var(--gold)', textTransform:'uppercase' }}>
              SEASON 17 LIVE
            </span>
          </div>

          <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(32px,5vw,68px)', fontWeight:900,
            color:'var(--gold-2)', lineHeight:1.1, marginBottom:20, letterSpacing:'0.02em' }}>
            ARCANE{' '}
            <span style={{
              background:'linear-gradient(90deg, #C89B3C, #F0E6C0, #C89B3C)',
              backgroundSize:'200% auto', WebkitBackgroundClip:'text',
              WebkitTextFillColor:'transparent', backgroundClip:'text',
              animation:'shimmer 3s linear infinite',
            }}>DEPTHS</span>
          </h1>

          <p style={{ fontFamily:"'Noto Sans KR',sans-serif", fontSize:18, fontWeight:500,
            color:'var(--muted)', maxWidth:480, marginBottom:32, lineHeight:1.6 }}>
            시즌 17 아케인 심연 — 챔피언 도감, 최강 덱 추천, 아이템 조합기를 한 곳에서.
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
            <div key={s.label} style={{ flex:'1 1 120px', padding:'18px 24px',
              borderRight: i < STATS.length-1 ? '1px solid var(--border)' : 'none', textAlign:'center' }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, fontWeight:700,
                color:'var(--gold)', marginBottom:4 }}>{s.num}</div>
              <div style={{ fontFamily:"'Noto Sans KR',sans-serif", fontSize:11, fontWeight:600,
                letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 인기 덱 ── */}
      <section style={{ padding:'48px 0' }}>
        <div className="container">
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
            <span className="section-label">추천 덱 TOP 5</span>
            <div className="gold-divider" style={{ flex:1, margin:0 }}/>
            <Link href="/decks" style={{ fontFamily:"'Noto Sans KR',sans-serif", fontSize:13,
              color:'var(--gold)', textDecoration:'none', fontWeight:600 }}>전체 보기 →</Link>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:12 }}>
            {topDecks.map(deck => {
              const tierColor = TIER_COLORS[deck.tier];
              return (
                <Link key={deck.id} href="/decks" style={{ textDecoration:'none' }}>
                  <div className="tft-card" style={{ borderLeft:`3px solid ${tierColor}` }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                      <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:15, fontWeight:700,
                        color:'var(--gold-2)' }}>{deck.name}</span>
                      <TierBadge tier={deck.tier} />
                    </div>
                    <div style={{ display:'flex', gap:4, marginBottom:10, flexWrap:'wrap' }}>
                      {deck.traits.slice(0,3).map(t => <TraitTag key={t} trait={t} />)}
                    </div>
                    {/* 실제 챔피언 이미지 */}
                    <div style={{ display:'flex', gap:3, flexWrap:'wrap', marginBottom:12 }}>
                      {deck.unitApiNames.slice(0,8).map(apiName => (
                        <ChampHex key={apiName} apiName={apiName} size={34} />
                      ))}
                    </div>
                    <div className="gold-divider" style={{ margin:'8px 0' }}/>
                    <div style={{ display:'flex', gap:16 }}>
                      {[
                        { label:'평균등수', val:`${deck.avgPlace}위` },
                        { label:'픽률',     val:`${deck.playRate}%` },
                        { label:'1등률',    val:`${deck.winRate}%` },
                      ].map(s => (
                        <div key={s.label}>
                          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:15, fontWeight:700, color:'var(--gold)' }}>{s.val}</div>
                          <div style={{ fontFamily:"'Noto Sans KR',sans-serif", fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.label}</div>
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

      {/* ── 가이드 미리보기 ── */}
      <section style={{ padding: '0 0 48px' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <span className="section-label">공략 가이드</span>
            <div className="gold-divider" style={{ flex: 1, margin: 0 }} />
            <Link href="/guides" style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 13, color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }}>전체 보기 →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { href: '/guides/tft-beginner-guide',  label: '완전 초보 가이드',     cat: '기초', color: '#4AE890' },
              { href: '/guides/tft-economy-guide',   label: '경제 운영 완벽 가이드', cat: '전략', color: '#4A9EE8' },
              { href: '/guides/tft-item-guide',      label: '아이템 완전 정복',      cat: '아이템', color: '#C89B3C' },
              { href: '/guides/tft-reroll-guide',    label: '리롤 전략 가이드',      cat: '전략', color: '#4A9EE8' },
            ].map(g => (
              <Link key={g.href} href={g.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'var(--navy-2)', border: '1px solid var(--border)',
                  borderTop: `2px solid ${g.color}`, borderRadius: 6, padding: '14px 16px',
                }}>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 11, color: g.color, letterSpacing: '0.08em', marginBottom: 6 }}>{g.cat}</div>
                  <div style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--gold-2)' }}>{g.label}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 증강체 티어 미리보기 ── */}
      <section style={{ padding:'0 0 60px' }}>
        <div className="container">
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
            <span className="section-label">증강체 티어</span>
            <div className="gold-divider" style={{ flex:1, margin:0 }}/>
            <Link href="/meta" style={{ fontFamily:"'Noto Sans KR',sans-serif", fontSize:13,
              color:'var(--gold)', textDecoration:'none', fontWeight:600 }}>전체 보기 →</Link>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:8 }}>
            {META_AUGMENTS.slice(0, 8).map(aug => {
              const tierColor = TIER_COLORS[aug.tier];
              return (
                <div key={aug.name} className="tft-card" style={{ borderLeft:`2px solid ${tierColor}`, padding:'12px 14px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                    <span className="tier-badge" style={{ color:tierColor, borderColor:tierColor,
                      background:`${tierColor}22`, width:22, height:22, fontSize:12 }}>{aug.tier}</span>
                    <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:13, fontWeight:700, color:'var(--gold-2)' }}>
                      {aug.name}
                    </span>
                  </div>
                  <div style={{ display:'flex', gap:12 }}>
                    <div>
                      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:14, fontWeight:700, color:'var(--gold)' }}>{aug.avgPlace.toFixed(1)}위</div>
                      <div style={{ fontFamily:"'Noto Sans KR',sans-serif", fontSize:9, color:'var(--muted)', textTransform:'uppercase' }}>평균등수</div>
                    </div>
                    <div>
                      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:14, fontWeight:700, color:tierColor }}>{aug.pickRate}%</div>
                      <div style={{ fontFamily:"'Noto Sans KR',sans-serif", fontSize:9, color:'var(--muted)', textTransform:'uppercase' }}>픽률</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 커뮤니티 팁 ── */}
      <CommunitySection />
    </div>
  );
}
