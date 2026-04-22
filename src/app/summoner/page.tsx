'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SummonerPage() {
  const [input, setInput] = useState('');
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    router.push(`/summoner/${encodeURIComponent(trimmed)}`);
  }

  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: 'var(--gold-2)', marginBottom: 8, letterSpacing: '0.05em' }}>
        소환사 검색
      </h1>
      <p style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 14, color: 'var(--muted)', marginBottom: 32 }}>
        소환사 이름#태그 를 입력하세요
      </p>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, width: '100%', maxWidth: 480 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Hide on bush#KR1"
          style={{
            flex: 1,
            background: 'var(--navy-2)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            padding: '12px 16px',
            fontFamily: "'Noto Sans KR',sans-serif",
            fontSize: 14,
            color: 'var(--text)',
            outline: 'none',
          }}
          autoFocus
        />
        <button type="submit" style={{
          background: 'var(--gold)',
          border: 'none',
          borderRadius: 4,
          padding: '12px 24px',
          fontFamily: "'Bebas Neue',sans-serif",
          fontSize: 16,
          color: '#050b18',
          cursor: 'pointer',
          letterSpacing: '0.05em',
          fontWeight: 700,
        }}>
          검색
        </button>
      </form>

      <p style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 12, color: 'var(--muted)', marginTop: 20 }}>
        * Riot API 연동 준비 중 — 현재 목업 데이터로 표시됩니다
      </p>
    </div>
  );
}
