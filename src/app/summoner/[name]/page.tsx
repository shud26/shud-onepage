'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

// ── 목업 데이터 (API 연동 전까지 사용) ──────────────────────────────
const MOCK_PROFILE = {
  name: '소환사',
  tagLine: 'KR1',
  level: 312,
  profileIconId: 4895,
  ranked: {
    tier: 'GOLD',
    rank: 'II',
    lp: 75,
    wins: 48,
    losses: 41,
  },
};

const MOCK_MATCHES = [
  { id: 1, placement: 1, timeAgo: '2시간 전', duration: '34분', traits: ['N.O.V.A. 4', '저격수 4', '말살자 2'], augments: ['거세진 폭풍', '전술가의 무기고'] },
  { id: 2, placement: 4, timeAgo: '3시간 전', duration: '28분', traits: ['정령족 6', '싸움꾼 4', '요새 2'], augments: ['정령의 은혜', '이중 타격'] },
  { id: 3, placement: 2, timeAgo: '5시간 전', duration: '31분', traits: ['암흑의 별 4', '습격자 4', '불한당 3'], augments: ['그림자 강화', '생명력 흡수'] },
  { id: 4, placement: 6, timeAgo: '어제',     duration: '22분', traits: ['동물특공대 4', '초능력 3', '선봉대 2'], augments: ['야생의 부름', '방어막 강화'] },
  { id: 5, placement: 3, timeAgo: '어제',     duration: '29분', traits: ['태고족 4', '운명술사 4', '중재자 2'], augments: ['고대의 힘', '전략가'] },
];

const TIER_COLORS: Record<string, string> = {
  IRON: '#6B5744', BRONZE: '#8C5B3E', SILVER: '#8D9DB6',
  GOLD: '#C89B3C', PLATINUM: '#00B4A0', EMERALD: '#00C44F',
  DIAMOND: '#4A9EE8', MASTER: '#9B45E0', GRANDMASTER: '#E85454',
  CHALLENGER: '#F0E6C0',
};

const PLACEMENT_COLORS: Record<number, string> = {
  1: '#C89B3C', 2: '#8D9DB6', 3: '#CD7F32',
};

export default function SummonerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const rawName = decodeURIComponent(params.name as string);
  const [searchInput, setSearchInput] = useState(rawName);

  const tierColor = TIER_COLORS[MOCK_PROFILE.ranked.tier] ?? '#aaa';
  const winRate = Math.round((MOCK_PROFILE.ranked.wins / (MOCK_PROFILE.ranked.wins + MOCK_PROFILE.ranked.losses)) * 100);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = searchInput.trim();
    if (!trimmed) return;
    router.push(`/summoner/${encodeURIComponent(trimmed)}`);
  }

  return (
    <div style={{ padding: '32px 0 80px' }}>
      <div className="container" style={{ maxWidth: 720 }}>

        {/* 검색바 */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            style={{
              flex: 1,
              background: 'var(--navy-2)',
              border: '1px solid var(--border)',
              borderRadius: 4,
              padding: '10px 14px',
              fontFamily: "'Noto Sans KR',sans-serif",
              fontSize: 14,
              color: 'var(--text)',
              outline: 'none',
            }}
          />
          <button type="submit" style={{
            background: 'var(--gold)',
            border: 'none',
            borderRadius: 4,
            padding: '10px 20px',
            fontFamily: "'Bebas Neue',sans-serif",
            fontSize: 15,
            color: '#050b18',
            cursor: 'pointer',
            letterSpacing: '0.05em',
          }}>
            검색
          </button>
        </form>

        {/* 목업 안내 배너 */}
        <div style={{
          background: 'rgba(200,155,60,0.08)',
          border: '1px solid rgba(200,155,60,0.2)',
          borderRadius: 4,
          padding: '10px 14px',
          marginBottom: 24,
          fontFamily: "'Noto Sans KR',sans-serif",
          fontSize: 12,
          color: 'var(--muted)',
        }}>
          ⚡ Riot API 연동 준비 중 — 현재 목업 데이터로 표시됩니다. 실제 데이터는 곧 제공될 예정입니다.
        </div>

        {/* 프로필 카드 */}
        <div style={{
          background: 'var(--navy-2)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '24px',
          display: 'flex',
          gap: 20,
          alignItems: 'center',
          marginBottom: 20,
          flexWrap: 'wrap',
        }}>
          {/* 아이콘 */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 72, height: 72, borderRadius: 8,
              background: 'var(--navy-3)',
              border: '2px solid var(--gold)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: 'var(--gold)',
            }}>
              {rawName[0]?.toUpperCase() ?? '?'}
            </div>
            <div style={{
              position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)',
              background: 'var(--navy-0)', border: '1px solid var(--border)',
              borderRadius: 3, padding: '1px 6px',
              fontFamily: "'Bebas Neue',sans-serif", fontSize: 11,
              color: 'var(--gold-2)', whiteSpace: 'nowrap',
            }}>
              Lv. {MOCK_PROFILE.level}
            </div>
          </div>

          {/* 이름 + 랭크 */}
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 20, fontWeight: 700, color: 'var(--gold-2)', marginBottom: 4 }}>
              {rawName}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{
                fontFamily: "'Bebas Neue',sans-serif", fontSize: 15,
                color: tierColor, letterSpacing: '0.06em',
              }}>
                {MOCK_PROFILE.ranked.tier} {MOCK_PROFILE.ranked.rank}
              </span>
              <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 15, color: 'var(--gold)' }}>
                {MOCK_PROFILE.ranked.lp} LP
              </span>
            </div>
          </div>

          {/* 승/패 */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: 'var(--gold-2)' }}>
              {winRate}%
            </div>
            <div style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 12, color: 'var(--muted)' }}>
              {MOCK_PROFILE.ranked.wins}승 {MOCK_PROFILE.ranked.losses}패
            </div>
          </div>
        </div>

        {/* 최근 매치 */}
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, color: 'var(--gold-2)', marginBottom: 12, letterSpacing: '0.05em' }}>
          최근 매치
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {MOCK_MATCHES.map(match => {
            const placeColor = PLACEMENT_COLORS[match.placement] ?? 'var(--muted)';
            const isTop4 = match.placement <= 4;
            return (
              <div key={match.id} style={{
                background: 'var(--navy-2)',
                border: '1px solid var(--border)',
                borderLeft: `3px solid ${isTop4 ? placeColor : '#444'}`,
                borderRadius: 6,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                flexWrap: 'wrap',
              }}>
                {/* 등수 */}
                <div style={{ textAlign: 'center', minWidth: 36 }}>
                  <div style={{
                    fontFamily: "'Bebas Neue',sans-serif", fontSize: 22,
                    color: placeColor, lineHeight: 1,
                  }}>
                    {match.placement}
                  </div>
                  <div style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 10, color: 'var(--muted)' }}>등</div>
                </div>

                {/* 트레잇 */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                    {match.traits.map(t => (
                      <span key={t} style={{
                        fontFamily: "'Noto Sans KR',sans-serif", fontSize: 11,
                        background: 'var(--navy-3)',
                        border: '1px solid var(--border)',
                        borderRadius: 3, padding: '2px 8px',
                        color: 'var(--gold-2)',
                      }}>{t}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {match.augments.map(a => (
                      <span key={a} style={{
                        fontFamily: "'Noto Sans KR',sans-serif", fontSize: 10,
                        color: 'var(--muted)',
                      }}>{a}</span>
                    ))}
                  </div>
                </div>

                {/* 시간 */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 12, color: 'var(--muted)' }}>{match.timeAgo}</div>
                  <div style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 11, color: 'var(--muted)', opacity: 0.7 }}>{match.duration}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
