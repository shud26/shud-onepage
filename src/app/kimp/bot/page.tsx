'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const PIN = '1507';

interface Position {
  id: string;
  coin: string;
  hl_side: string;
  by_side: string;
  entry_spread: number;
  entry_abs_spread: number;
  entry_annual_pct: number;
  entry_hl_rate: number;
  entry_by_rate: number;
  entry_hl_px: number;
  entry_by_px: number;
  entry_time: string;
  margin_per_side: number;
  notional_per_side: number;
  total_margin: number;
  total_notional: number;
  leverage: number;
  entry_fee: number;
  funding_earned_hl: number;
  funding_earned_by: number;
  funding_earned_total: number;
  funding_count: number;
  status: string;
  // closed fields
  exit_time?: string;
  close_reason?: string;
  price_pnl?: number;
  funding_pnl?: number;
  exit_fee?: number;
  net_pnl?: number;
  net_pnl_pct?: number;
  // pair trading fields (alternate format)
  type?: string;
  long_symbol?: string;
  short_symbol?: string;
  symbol?: string;
  amount_krw?: number;
  amount_usd?: number;
  raw_pnl_pct?: number;
  fee_pct?: number;
  pnl_krw?: number;
  pnl_usd?: number;
}

interface Spread {
  coin: string;
  abs_spread: number;
  annual_pct: number;
  hl_side: string;
  by_side: string;
  hl_rate: number;
  by_rate: number;
  hours_to_be: number;
}

interface BotState {
  positions: Position[];
  virtual_usd: number;
  initial_usd: number;
  total_pnl: number;
  total_funding_earned: number;
  trades_count: number;
  daily_pnl_usd: number;
  circuit_breaker: boolean;
  consecutive_losses: number;
  started_at: string;
  mode: string;
  _top_spreads?: Spread[];
  // pair trading extras
  virtual_krw?: number;
  live_positions?: Position[];
}

export default function KimpBotDashboard() {
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState('');
  const [botState, setBotState] = useState<BotState | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // PIN check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('kimp-bot-pin');
      if (saved === PIN) setAuthed(true);
    }
  }, []);

  const handlePin = () => {
    if (pin === PIN) {
      setAuthed(true);
      sessionStorage.setItem('kimp-bot-pin', pin);
    } else {
      setPin('');
    }
  };

  // Fetch from Supabase
  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(
        'https://ofpbscpcryquxrtojpei.supabase.co/rest/v1/kimp_bot_state?id=eq.1&select=state,updated_at',
        {
          headers: {
            apikey:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mcGJzY3BjcnlxdXhydG9qcGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMTY2MTMsImV4cCI6MjA4NDc5MjYxM30.xqmqiAXsxU9rCk6j9tV_0c3UjrX-t5ee5xsLUccpmE4',
          },
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data && data[0]) {
        setBotState(data[0].state);
        setUpdatedAt(data[0].updated_at);
        setError(null);
      } else {
        setError('데이터 없음 (봇이 아직 동기화하지 않음)');
      }
    } catch (e) {
      setError(`연결 실패: ${e instanceof Error ? e.message : 'unknown'}`);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authed) return;
    fetchState();
    const interval = setInterval(fetchState, 10000);
    return () => clearInterval(interval);
  }, [authed, fetchState]);

  // Helpers
  const fmtUsd = (v: number) =>
    `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fmtPct = (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(2)}%`;
  const fmtTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };
  const fmtDuration = (iso: string) => {
    try {
      const ms = Date.now() - new Date(iso).getTime();
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
      return `${h}h ${m}m`;
    } catch {
      return '-';
    }
  };
  const sinceUpdate = () => {
    if (!updatedAt) return '-';
    const s = Math.floor((Date.now() - new Date(updatedAt).getTime()) / 1000);
    if (s < 60) return `${s}초 전`;
    if (s < 3600) return `${Math.floor(s / 60)}분 전`;
    return `${Math.floor(s / 3600)}시간 전`;
  };
  const isStale = () => {
    if (!updatedAt) return true;
    return Date.now() - new Date(updatedAt).getTime() > 120000; // 2분 이상 = stale
  };

  // PIN screen
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-8 w-80">
          <h2 className="text-lg font-bold text-white mb-1">Kimp Bot Dashboard</h2>
          <p className="text-[#6B6B70] text-xs mb-6">포지션 확인을 위해 PIN을 입력하세요</p>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handlePin()}
            placeholder="PIN"
            className="w-full bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-3 text-white text-center text-lg tracking-[0.3em] font-mono focus:outline-none focus:border-[#FF5C00] mb-4"
            autoFocus
          />
          <button
            onClick={handlePin}
            className="w-full py-3 bg-[#FF5C00] hover:bg-[#FF8A4C] text-white font-medium rounded-lg transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    );
  }

  const openPositions = botState?.positions?.filter((p) => p.status === 'open') || [];
  const closedPositions = (botState?.positions?.filter((p) => p.status === 'closed') || []).slice(-5).reverse();
  const topSpreads = botState?._top_spreads || [];

  // Summary stats
  const totalTrades = botState?.trades_count || 0;
  const wins = (botState?.positions?.filter((p) => p.status === 'closed' && (p.net_pnl ?? 0) > 0) || []).length;
  const losses = (botState?.positions?.filter((p) => p.status === 'closed' && (p.net_pnl ?? 0) <= 0) || []).length;
  const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : '0';
  const openMargin = openPositions.reduce((s, p) => s + (p.total_margin || 0), 0);
  const openFunding = openPositions.reduce((s, p) => s + (p.funding_earned_total || 0), 0);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#e5e5e5]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0A0A0B]/80 backdrop-blur-md border-b border-[#1F1F23]">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/kimp" className="text-lg font-bold tracking-tight">
              KIMP<span className="text-[#FF5C00]">.</span>BOT
            </Link>
            <nav className="hidden md:flex items-center gap-1 text-sm">
              <Link
                href="/kimp"
                className="px-3 py-1.5 rounded-lg text-[#8B8B90] hover:text-white hover:bg-[#111113] transition-colors"
              >
                김프
              </Link>
              <span className="px-3 py-1.5 rounded-lg bg-[#1A1A1D] text-white">봇</span>
              <Link
                href="/kimp/sim"
                className="px-3 py-1.5 rounded-lg text-[#8B8B90] hover:text-white hover:bg-[#111113] transition-colors"
              >
                시뮬
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                isStale()
                  ? 'bg-[rgba(239,68,68,0.08)]'
                  : 'bg-[rgba(34,197,94,0.08)]'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isStale() ? 'bg-[#EF4444]' : 'bg-[#22C55E] animate-pulse'
                }`}
              ></span>
              <span
                className={`text-[11px] font-medium ${
                  isStale() ? 'text-[#EF4444]' : 'text-[#22C55E]'
                }`}
              >
                {isStale() ? 'STALE' : 'LIVE'}
              </span>
            </span>
            <span className="text-[10px] text-[#6B6B70]">{sinceUpdate()}</span>
            <button
              onClick={fetchState}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#FF5C00] hover:bg-[#FF8A4C] transition-colors"
            >
              &#8635;
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#6B6B70]">
            <div className="w-6 h-6 border-2 border-[#FF5C00] border-t-transparent rounded-full animate-spin mr-3"></div>
            Supabase에서 봇 상태 불러오는 중...
          </div>
        ) : error ? (
          <div className="bg-[#111113] border border-[#EF4444]/20 rounded-xl p-8 text-center">
            <p className="text-[#EF4444] font-medium mb-2">연결 오류</p>
            <p className="text-[#6B6B70] text-sm">{error}</p>
            <p className="text-[#4A4A4E] text-xs mt-4">
              iMac에서 kimp_bot이 실행 중인지 확인하세요.
              <br />
              봇이 Supabase에 state를 동기화해야 대시보드에 표시됩니다.
            </p>
          </div>
        ) : !botState || !botState.started_at ? (
          <div className="bg-[#111113] border border-[#F59E0B]/20 rounded-xl p-8 text-center">
            <p className="text-[#F59E0B] font-medium mb-2">봇 데이터 없음</p>
            <p className="text-[#6B6B70] text-sm">
              kimp_bot이 아직 Supabase에 state를 동기화하지 않았습니다.
              <br />
              봇을 시작하면 30초마다 자동으로 업데이트됩니다.
            </p>
          </div>
        ) : (
          <>
            {/* === 봇 상태 + 잔액 === */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 봇 상태 */}
              <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-5">
                <p className="text-[10px] text-[#6B6B70] uppercase tracking-wider mb-3">봇 상태</p>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#8B8B90]">모드</span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        botState.mode === 'live'
                          ? 'bg-[#EF4444]/10 text-[#EF4444]'
                          : botState.mode === 'dry-run'
                          ? 'bg-[#F59E0B]/10 text-[#F59E0B]'
                          : 'bg-[#3B82F6]/10 text-[#3B82F6]'
                      }`}
                    >
                      {(botState.mode || 'paper').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-[#8B8B90]">업타임</span>
                    <span className="text-xs font-mono text-[#ADADB0]">
                      {botState.started_at ? fmtDuration(botState.started_at) : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-[#8B8B90]">시작 시간</span>
                    <span className="text-xs font-mono text-[#ADADB0]">
                      {botState.started_at ? fmtTime(botState.started_at) : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-[#8B8B90]">마지막 동기화</span>
                    <span className={`text-xs font-mono ${isStale() ? 'text-[#EF4444]' : 'text-[#ADADB0]'}`}>
                      {sinceUpdate()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-[#8B8B90]">열린 포지션</span>
                    <span className="text-xs font-mono text-white font-medium">{openPositions.length}</span>
                  </div>
                </div>
              </div>

              {/* 잔액 */}
              <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-5">
                <p className="text-[10px] text-[#6B6B70] uppercase tracking-wider mb-3">잔액</p>
                <div className="mb-3">
                  <span className="text-2xl font-bold font-mono text-white">
                    {fmtUsd(botState.virtual_usd || 0)}
                  </span>
                  <p className="text-[10px] text-[#6B6B70] mt-0.5">가용 잔액 (USD)</p>
                </div>
                {botState.virtual_krw !== undefined && (
                  <div className="mb-3">
                    <span className="text-lg font-bold font-mono text-[#ADADB0]">
                      ₩{(botState.virtual_krw || 0).toLocaleString()}
                    </span>
                    <p className="text-[10px] text-[#6B6B70] mt-0.5">가용 잔액 (KRW)</p>
                  </div>
                )}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#8B8B90]">초기 자본</span>
                    <span className="font-mono text-[#ADADB0]">{fmtUsd(botState.initial_usd || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B8B90]">투입 마진</span>
                    <span className="font-mono text-[#ADADB0]">{fmtUsd(openMargin)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B8B90]">Total (가용+마진)</span>
                    <span className="font-mono text-white font-medium">
                      {fmtUsd((botState.virtual_usd || 0) + openMargin)}
                    </span>
                  </div>
                </div>
              </div>

              {/* PnL */}
              <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-5">
                <p className="text-[10px] text-[#6B6B70] uppercase tracking-wider mb-3">성과</p>
                <div className="mb-3">
                  <span
                    className={`text-2xl font-bold font-mono ${
                      (botState.total_pnl || 0) >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'
                    }`}
                  >
                    {fmtPct(botState.total_pnl || 0)}
                  </span>
                  <p className="text-[10px] text-[#6B6B70] mt-0.5">총 PnL</p>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#8B8B90]">오늘 PnL</span>
                    <span
                      className={`font-mono ${
                        (botState.daily_pnl_usd || 0) >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'
                      }`}
                    >
                      {fmtUsd(botState.daily_pnl_usd || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B8B90]">누적 펀딩</span>
                    <span className="font-mono text-[#22C55E]">{fmtUsd(botState.total_funding_earned || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B8B90]">거래 수</span>
                    <span className="font-mono text-[#ADADB0]">{totalTrades}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B8B90]">승률</span>
                    <span className="font-mono text-[#ADADB0]">
                      {winRate}% ({wins}W / {losses}L)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B8B90]">미실현 펀딩</span>
                    <span
                      className={`font-mono ${openFunding >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}
                    >
                      {fmtUsd(openFunding)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* === 긴급 정보 === */}
            {(botState.circuit_breaker || (botState.consecutive_losses || 0) >= 2) && (
              <div
                className={`rounded-xl p-4 border ${
                  botState.circuit_breaker
                    ? 'bg-[#EF4444]/5 border-[#EF4444]/20'
                    : 'bg-[#F59E0B]/5 border-[#F59E0B]/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{botState.circuit_breaker ? '🚨' : '⚠️'}</span>
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        botState.circuit_breaker ? 'text-[#EF4444]' : 'text-[#F59E0B]'
                      }`}
                    >
                      {botState.circuit_breaker ? '서킷 브레이커 활성화' : `연속 손실 ${botState.consecutive_losses}회`}
                    </p>
                    <p className="text-xs text-[#6B6B70]">
                      {botState.circuit_breaker
                        ? '일일 손실 한도 초과. 내일 자동 해제됩니다.'
                        : '3회 연속 손실 시 쿨다운 진입합니다.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* === 열린 포지션 === */}
            <div className="bg-[#111113] border border-[#1F1F23] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#1F1F23] flex items-center justify-between">
                <h2 className="text-sm font-semibold">
                  열린 포지션 <span className="text-[#FF5C00]">{openPositions.length}</span>
                </h2>
              </div>
              {openPositions.length === 0 ? (
                <div className="px-5 py-8 text-center text-[#4A4A4E] text-sm">포지션 없음</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[#6B6B70] border-b border-[#1F1F23] bg-[#0D0D0E] text-[10px] uppercase tracking-wider">
                        <th className="text-left py-2.5 px-4">코인</th>
                        <th className="text-center py-2.5 px-3">방향</th>
                        <th className="text-right py-2.5 px-3">노셔널</th>
                        <th className="text-right py-2.5 px-3">펀딩 수익</th>
                        <th className="text-right py-2.5 px-3">보유 시간</th>
                        <th className="text-right py-2.5 px-3">스프레드</th>
                      </tr>
                    </thead>
                    <tbody>
                      {openPositions.map((p) => (
                        <tr key={p.id} className="border-b border-[#1F1F23]/50 hover:bg-[#0A0A0B]">
                          <td className="py-3 px-4">
                            <span className="font-medium text-white">{p.coin || p.symbol || '-'}</span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-[11px]">
                              {p.hl_side && (
                                <>
                                  <span className="text-[#8B8B90]">HL</span>
                                  <span
                                    className={
                                      p.hl_side === 'long' ? 'text-[#22C55E] font-medium' : 'text-[#EF4444] font-medium'
                                    }
                                  >
                                    {p.hl_side[0].toUpperCase()}
                                  </span>
                                  <span className="text-[#333]">|</span>
                                  <span className="text-[#8B8B90]">BY</span>
                                  <span
                                    className={
                                      p.by_side === 'long' ? 'text-[#22C55E] font-medium' : 'text-[#EF4444] font-medium'
                                    }
                                  >
                                    {p.by_side?.[0].toUpperCase()}
                                  </span>
                                </>
                              )}
                              {p.long_symbol && (
                                <>
                                  <span className="text-[#22C55E]">L:{p.long_symbol}</span>
                                  <span className="text-[#333]">/</span>
                                  <span className="text-[#EF4444]">S:{p.short_symbol}</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="text-right py-3 px-3 font-mono text-xs text-[#ADADB0]">
                            {p.total_notional ? fmtUsd(p.total_notional) : p.amount_usd ? fmtUsd(p.amount_usd) : '-'}
                          </td>
                          <td className="text-right py-3 px-3">
                            <span
                              className={`font-mono text-xs ${
                                (p.funding_earned_total || 0) >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'
                              }`}
                            >
                              {fmtUsd(p.funding_earned_total || 0)}
                            </span>
                            {p.funding_count !== undefined && (
                              <span className="text-[10px] text-[#6B6B70] ml-1">({p.funding_count}h)</span>
                            )}
                          </td>
                          <td className="text-right py-3 px-3 font-mono text-xs text-[#ADADB0]">
                            {p.entry_time ? fmtDuration(p.entry_time) : '-'}
                          </td>
                          <td className="text-right py-3 px-3 font-mono text-xs text-[#ADADB0]">
                            {p.entry_abs_spread !== undefined
                              ? `${(p.entry_abs_spread * 100).toFixed(4)}%/hr`
                              : p.entry_spread !== undefined
                              ? `${p.entry_spread.toFixed(2)}%`
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* === 최근 종료 포지션 === */}
            {closedPositions.length > 0 && (
              <div className="bg-[#111113] border border-[#1F1F23] rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-[#1F1F23]">
                  <h2 className="text-sm font-semibold">최근 종료 포지션</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[#6B6B70] border-b border-[#1F1F23] bg-[#0D0D0E] text-[10px] uppercase tracking-wider">
                        <th className="text-left py-2.5 px-4">코인</th>
                        <th className="text-right py-2.5 px-3">Net PnL</th>
                        <th className="text-right py-2.5 px-3">펀딩</th>
                        <th className="text-right py-2.5 px-3">종료 사유</th>
                        <th className="text-right py-2.5 px-3">종료 시각</th>
                      </tr>
                    </thead>
                    <tbody>
                      {closedPositions.map((p) => {
                        const pnl = p.net_pnl ?? p.pnl_usd ?? 0;
                        const pnlPct = p.net_pnl_pct ?? p.net_pnl_pct ?? 0;
                        return (
                          <tr key={p.id} className="border-b border-[#1F1F23]/50 hover:bg-[#0A0A0B]">
                            <td className="py-2.5 px-4 font-medium text-white text-xs">
                              {p.coin || p.symbol || '-'}
                            </td>
                            <td className="text-right py-2.5 px-3">
                              <span
                                className={`font-mono text-xs font-medium ${
                                  pnl >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'
                                }`}
                              >
                                {fmtUsd(pnl)} ({fmtPct(pnlPct)})
                              </span>
                            </td>
                            <td className="text-right py-2.5 px-3 font-mono text-xs text-[#ADADB0]">
                              {fmtUsd(p.funding_pnl ?? p.funding_earned_total ?? 0)}
                            </td>
                            <td className="text-right py-2.5 px-3 text-xs text-[#8B8B90]">
                              {p.close_reason || '-'}
                            </td>
                            <td className="text-right py-2.5 px-3 font-mono text-[10px] text-[#6B6B70]">
                              {p.exit_time ? fmtTime(p.exit_time) : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* === Top 스프레드 기회 === */}
            {topSpreads.length > 0 && (
              <div className="bg-[#111113] border border-[#1F1F23] rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-[#1F1F23]">
                  <h2 className="text-sm font-semibold">
                    실시간 스프레드 TOP <span className="text-[#FF5C00]">{topSpreads.length}</span>
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[#6B6B70] border-b border-[#1F1F23] bg-[#0D0D0E] text-[10px] uppercase tracking-wider">
                        <th className="text-left py-2.5 px-4">코인</th>
                        <th className="text-right py-2.5 px-3">스프레드/hr</th>
                        <th className="text-right py-2.5 px-3">연율</th>
                        <th className="text-center py-2.5 px-3">방향</th>
                        <th className="text-right py-2.5 px-3">HL Rate</th>
                        <th className="text-right py-2.5 px-3">BY Rate</th>
                        <th className="text-right py-2.5 px-3">BE(h)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topSpreads.map((s, i) => (
                        <tr key={i} className="border-b border-[#1F1F23]/50 hover:bg-[#0A0A0B]">
                          <td className="py-2.5 px-4 font-medium text-white text-xs">{s.coin}</td>
                          <td className="text-right py-2.5 px-3">
                            <span
                              className={`font-mono text-xs font-medium ${
                                s.abs_spread >= 0.0002 ? 'text-[#22C55E]' : 'text-[#ADADB0]'
                              }`}
                            >
                              {(s.abs_spread * 100).toFixed(4)}%
                            </span>
                          </td>
                          <td className="text-right py-2.5 px-3">
                            <span
                              className={`font-mono text-xs ${
                                s.annual_pct >= 50 ? 'text-[#22C55E]' : 'text-[#ADADB0]'
                              }`}
                            >
                              {s.annual_pct > 0 ? '+' : ''}
                              {s.annual_pct.toFixed(0)}%
                            </span>
                          </td>
                          <td className="text-center py-2.5 px-3 text-[11px]">
                            <span className="text-[#8B8B90]">HL:</span>
                            <span
                              className={
                                s.hl_side === 'long' ? 'text-[#22C55E] ml-0.5' : 'text-[#EF4444] ml-0.5'
                              }
                            >
                              {s.hl_side?.[0].toUpperCase()}
                            </span>
                            <span className="text-[#333] mx-1">|</span>
                            <span className="text-[#8B8B90]">BY:</span>
                            <span
                              className={
                                s.by_side === 'long' ? 'text-[#22C55E] ml-0.5' : 'text-[#EF4444] ml-0.5'
                              }
                            >
                              {s.by_side?.[0].toUpperCase()}
                            </span>
                          </td>
                          <td className="text-right py-2.5 px-3 font-mono text-[11px] text-[#ADADB0]">
                            {(s.hl_rate * 100).toFixed(4)}%
                          </td>
                          <td className="text-right py-2.5 px-3 font-mono text-[11px] text-[#ADADB0]">
                            {(s.by_rate * 100).toFixed(4)}%
                          </td>
                          <td className="text-right py-2.5 px-3 font-mono text-[11px] text-[#8B8B90]">
                            {s.hours_to_be?.toFixed(0) ?? '-'}h
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* === live_positions (pair trading) === */}
            {(botState.live_positions?.filter((p) => p.status === 'open') || []).length > 0 && (
              <div className="bg-[#111113] border border-[#F59E0B]/20 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-[#1F1F23]">
                  <h2 className="text-sm font-semibold">
                    실전 포지션 (Live)
                    <span className="text-[#F59E0B] ml-2">
                      {botState.live_positions?.filter((p) => p.status === 'open').length}
                    </span>
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[#6B6B70] border-b border-[#1F1F23] bg-[#0D0D0E] text-[10px] uppercase tracking-wider">
                        <th className="text-left py-2.5 px-4">페어</th>
                        <th className="text-right py-2.5 px-3">금액</th>
                        <th className="text-right py-2.5 px-3">진입 스프레드</th>
                        <th className="text-right py-2.5 px-3">보유 시간</th>
                      </tr>
                    </thead>
                    <tbody>
                      {botState.live_positions
                        ?.filter((p) => p.status === 'open')
                        .map((p) => (
                          <tr key={p.id} className="border-b border-[#1F1F23]/50">
                            <td className="py-2.5 px-4 text-xs">
                              <span className="text-[#22C55E]">L:{p.long_symbol}</span>
                              <span className="text-[#333] mx-1">/</span>
                              <span className="text-[#EF4444]">S:{p.short_symbol}</span>
                            </td>
                            <td className="text-right py-2.5 px-3 font-mono text-xs text-[#ADADB0]">
                              {p.amount_usd ? fmtUsd(p.amount_usd) : p.amount_krw ? `₩${p.amount_krw.toLocaleString()}` : '-'}
                            </td>
                            <td className="text-right py-2.5 px-3 font-mono text-xs text-[#ADADB0]">
                              {p.entry_spread?.toFixed(3) ?? '-'}%
                            </td>
                            <td className="text-right py-2.5 px-3 font-mono text-xs text-[#ADADB0]">
                              {p.entry_time ? fmtDuration(p.entry_time) : '-'}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* === 풋터 정보 === */}
            <div className="text-center text-[10px] text-[#4A4A4E] pb-4 space-y-1">
              <p>10초 자동 폴링 · iMac → Supabase → 대시보드</p>
              <p>
                봇 경로: hun@192.168.45.214:~/kimp_bot · state 크기:{' '}
                {botState ? JSON.stringify(botState).length.toLocaleString() : '-'} bytes
              </p>
            </div>
          </>
        )}
      </main>

      {/* 모바일 하단 탭바 */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#0A0A0B]/95 backdrop-blur-md border-t border-[#1F1F23]">
        <div className="flex justify-around py-2 pb-[env(safe-area-inset-bottom)]">
          <Link href="/" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#6B6B70]"><span className="text-lg">🏠</span><span className="text-[10px]">홈</span></Link>
          <Link href="/kimp" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#6B6B70]"><span className="text-lg">📊</span><span className="text-[10px]">김프</span></Link>
          <span className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#FF5C00]"><span className="text-lg">🤖</span><span className="text-[10px]">봇</span></span>
          <Link href="/kimp/sim" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#6B6B70]"><span className="text-lg">🎲</span><span className="text-[10px]">시뮬</span></Link>
          <Link href="/blog" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#6B6B70]"><span className="text-lg">📝</span><span className="text-[10px]">블로그</span></Link>
        </div>
      </nav>
      <div className="h-16 md:hidden"></div>
    </div>
  );
}
